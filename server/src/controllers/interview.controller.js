import { pool } from "../config/db.js";
import { HttpError } from "../utils/HttpError.js";
import { generateQuestions, evaluateAnswer } from "../services/aiService.js";

const DIFFICULTIES = ["easy", "medium", "hard"];

// Ownership helpers: every query is scoped to the logged-in user
async function getOwnedSession(sessionId, userId) {
  const [rows] = await pool.query(
    "SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?",
    [sessionId, userId]
  );
  if (!rows.length) throw new HttpError(404, "Session not found");
  return rows[0];
}

/* POST /api/interview/sessions */
export async function createSession(req, res) {
  const { role, difficulty = "medium", topics = [], count = 5 } = req.body;

  if (!role?.trim()) throw new HttpError(400, "Role is required");
  if (!DIFFICULTIES.includes(difficulty)) throw new HttpError(400, "Invalid difficulty");
  const n = Number(count);
  if (!Number.isInteger(n) || n < 1 || n > 15) throw new HttpError(400, "Count must be between 1 and 15");

  // Generate first, so a failed AI call doesn't leave an empty session behind
  const generated = await generateQuestions({
    role: role.trim(),
    difficulty,
    topics: Array.isArray(topics) ? topics : [],
    count: n,
  });
  if (!generated.length) throw new HttpError(502, "AI returned no questions, please try again");

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [sessionResult] = await conn.query(
      "INSERT INTO interview_sessions (user_id, role, difficulty) VALUES (?, ?, ?)",
      [req.user.id, role.trim(), difficulty]
    );
    const sessionId = sessionResult.insertId;

    const values = generated.map((q, i) => [sessionId, q, i]);
    await conn.query(
      "INSERT INTO questions (session_id, question_text, question_order) VALUES ?",
      [values]
    );

    await conn.commit();

    const [questions] = await pool.query(
      "SELECT id, question_text FROM questions WHERE session_id = ? ORDER BY question_order",
      [sessionId]
    );
    res.status(201).json({ sessionId, questions });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function submitAnswer(req, res) {
  const { questionId } = req.params;
  const { answer } = req.body;

  if (!answer?.trim()) throw new HttpError(400, "Answer is required");
  if (answer.length > 5000) throw new HttpError(400, "Answer is too long (max 5000 characters)");

  const [rows] = await pool.query(
    `SELECT q.id, q.question_text, s.role, s.status
     FROM questions q
     JOIN interview_sessions s ON q.session_id = s.id
     WHERE q.id = ? AND s.user_id = ?`,
    [questionId, req.user.id]
  );
  const question = rows[0];
  if (!question) throw new HttpError(404, "Question not found");
  if (question.status === "completed") throw new HttpError(409, "Session already completed");

  const result = await evaluateAnswer({
    question: question.question_text,
    answer: answer.trim(),
    role: question.role,
  });

  const score = Math.max(0, Math.min(10, Number(result.score) || 0));

  // question_id is UNIQUE, so re-answering overwrites the earlier attempt
  await pool.query(
    `INSERT INTO answers (question_id, answer_text, score, feedback, strengths, improvements, keywords_matched)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       answer_text = VALUES(answer_text), score = VALUES(score), feedback = VALUES(feedback),
       strengths = VALUES(strengths), improvements = VALUES(improvements),
       keywords_matched = VALUES(keywords_matched)`,
    [
      questionId,
      answer.trim(),
      score,
      result.feedback || "",
      JSON.stringify(result.strengths || []),
      JSON.stringify(result.improvements || []),
      JSON.stringify(result.keywords_matched || []),
    ]
  );

  res.json({ ...result, score });
}

/* POST /api/interview/sessions/:sessionId/complete */
export async function completeSession(req, res) {
  const session = await getOwnedSession(req.params.sessionId, req.user.id);

  const [[{ avgScore }]] = await pool.query(
    `SELECT AVG(a.score) AS avgScore
     FROM answers a JOIN questions q ON a.question_id = q.id
     WHERE q.session_id = ?`,
    [session.id]
  );

  await pool.query(
    "UPDATE interview_sessions SET status = 'completed', overall_score = ? WHERE id = ?",
    [avgScore, session.id]
  );
  res.json({ overall_score: avgScore });
}

export async function listSessions(req, res) {
  const [rows] = await pool.query(
    `SELECT id, role, difficulty, status, overall_score, created_at
     FROM interview_sessions WHERE user_id = ? ORDER BY created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
}

export async function getSession(req, res) {
  const session = await getOwnedSession(req.params.sessionId, req.user.id);

  const [rows] = await pool.query(
    `SELECT q.id AS question_id, q.question_text,
            a.answer_text, a.score, a.feedback, a.strengths, a.improvements, a.keywords_matched
     FROM questions q
     LEFT JOIN answers a ON a.question_id = q.id
     WHERE q.session_id = ?
     ORDER BY q.question_order`,
    [session.id]
  );

 
  const parse = (v) => (typeof v === "string" ? JSON.parse(v) : v || []);
  const items = rows.map((r) => ({
    ...r,
    strengths: parse(r.strengths),
    improvements: parse(r.improvements),
    keywords_matched: parse(r.keywords_matched),
  }));

  res.json({ session, items });
}


export async function deleteSession(req, res) {
  const session = await getOwnedSession(req.params.sessionId, req.user.id);
  await pool.query("DELETE FROM interview_sessions WHERE id = ?", [session.id]);
  res.status(204).end();
}

/* GET /api/interview/performance */
export async function getPerformance(req, res) {
  const [sessions] = await pool.query(
    `SELECT id, role, difficulty, overall_score, created_at
     FROM interview_sessions
     WHERE user_id = ? AND status = 'completed'
     ORDER BY created_at ASC`,
    [req.user.id]
  );

  const [answers] = await pool.query(
    `SELECT s.id AS session_id, q.question_text, a.score, a.keywords_matched
     FROM answers a
     JOIN questions q ON a.question_id = q.id
     JOIN interview_sessions s ON q.session_id = s.id
     WHERE s.user_id = ?`,
    [req.user.id]
  );

  const pct = (n) => Math.round(Number(n) * 10);   // scores are stored 0-10
  const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

  const scored = sessions.filter((s) => s.overall_score != null);
  const scores = scored.map((s) => Number(s.overall_score));

  // Recent change: last 3 sessions vs the (up to) 3 before them
  let change = null;
  if (scores.length >= 2) {
    const recent = scores.slice(-3);
    const earlier = scores.slice(Math.max(0, scores.length - 6), scores.length - recent.length);
    if (earlier.length) change = pct(avg(recent)) - pct(avg(earlier));
  }

  // Group sessions by a key and average the scores
  const groupBy = (keyFn) => {
    const map = new Map();
    for (const s of scored) {
      const key = keyFn(s);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(Number(s.overall_score));
    }
    return [...map.entries()].map(([name, vals]) => ({
      name, score: pct(avg(vals)), count: vals.length,
    }));
  };

  const order = ["easy", "medium", "hard"];
  const byDifficulty = groupBy((s) => s.difficulty)
    .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
  const byTopic = groupBy((s) => s.role).sort((a, b) => b.count - a.count).slice(0, 6);

  // Answer quality buckets
  const distribution = { needsWork: 0, fair: 0, good: 0, excellent: 0 };
  for (const a of answers) {
    const s = Number(a.score);
    if (s >= 9) distribution.excellent++;
    else if (s >= 7) distribution.good++;
    else if (s >= 5) distribution.fair++;
    else distribution.needsWork++;
  }

  // Most frequent keywords the candidate used correctly
  const kwCount = new Map();
  for (const a of answers) {
    const list = typeof a.keywords_matched === "string"
      ? JSON.parse(a.keywords_matched) : a.keywords_matched || [];
    for (const kw of list) {
      const k = String(kw).trim().toLowerCase();
      if (k) kwCount.set(k, (kwCount.get(k) || 0) + 1);
    }
  }
  const topKeywords = [...kwCount.entries()]
    .sort((a, b) => b[1] - a[1]).slice(0, 12)
    .map(([word, count]) => ({ word, count }));

  const weakest = [...answers]
    .sort((a, b) => Number(a.score) - Number(b.score)).slice(0, 5)
    .map((a) => ({
      session_id: a.session_id, question_text: a.question_text, score: pct(a.score),
    }));

  res.json({
    summary: {
      interviews: sessions.length,
      questionsAnswered: answers.length,
      averageScore: scores.length ? pct(avg(scores)) : null,
      bestScore: scores.length ? pct(Math.max(...scores)) : null,
      change,
    },
    trend: scored.map((s, i) => ({
      name: `#${i + 1}`,
      date: s.created_at,
      role: s.role,
      score: pct(s.overall_score),
    })),
    byDifficulty,
    byTopic,
    distribution,
    topKeywords,
    weakest,
  });
}