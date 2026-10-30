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

/* POST /api/interview/questions/:questionId/answer */
export async function submitAnswer(req, res) {
  const { questionId } = req.params;
  const { answer } = req.body;

  if (!answer?.trim()) throw new HttpError(400, "Answer is required");
  if (answer.length > 5000) throw new HttpError(400, "Answer is too long (max 5000 characters)");

  // Join to sessions so users can only answer their own questions
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

/* GET /api/interview/sessions */
export async function listSessions(req, res) {
  const [rows] = await pool.query(
    `SELECT id, role, difficulty, status, overall_score, created_at
     FROM interview_sessions WHERE user_id = ? ORDER BY created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
}

/* GET /api/interview/sessions/:sessionId */
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

  // mysql2 returns JSON columns already parsed; fall back to parsing strings
  const parse = (v) => (typeof v === "string" ? JSON.parse(v) : v || []);
  const items = rows.map((r) => ({
    ...r,
    strengths: parse(r.strengths),
    improvements: parse(r.improvements),
    keywords_matched: parse(r.keywords_matched),
  }));

  res.json({ session, items });
}

/* DELETE /api/interview/sessions/:sessionId */
export async function deleteSession(req, res) {
  const session = await getOwnedSession(req.params.sessionId, req.user.id);
  await pool.query("DELETE FROM interview_sessions WHERE id = ?", [session.id]);
  res.status(204).end();
}