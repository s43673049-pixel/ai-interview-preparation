import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import { HttpError } from "../utils/HttpError.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_PREFS = { emailNotifs: true, reminders: true, weeklyReport: false };
const PREF_KEYS = Object.keys(DEFAULT_PREFS);

const parseJson = (v) => (typeof v === "string" ? JSON.parse(v) : v || {});


export async function getProfile(req, res) {
  const [rows] = await pool.query(
    "SELECT id, name, email, bio, preferences, created_at FROM users WHERE id = ?",
    [req.user.id]
  );
  if (!rows.length) throw new HttpError(404, "User not found");
  const u = rows[0];

  const [[s]] = await pool.query(
    `SELECT COUNT(*) AS interviews, AVG(overall_score) AS avgScore, MAX(overall_score) AS bestScore
     FROM interview_sessions WHERE user_id = ? AND status = 'completed'`,
    [req.user.id]
  );
  const [[q]] = await pool.query(
    `SELECT COUNT(*) AS questions
     FROM answers a
     JOIN questions qu ON a.question_id = qu.id
     JOIN interview_sessions se ON qu.session_id = se.id
     WHERE se.user_id = ?`,
    [req.user.id]
  );

  res.json({
    user: { id: u.id, name: u.name, email: u.email, bio: u.bio, created_at: u.created_at },
    preferences: { ...DEFAULT_PREFS, ...parseJson(u.preferences) },
    stats: {
      interviews: s.interviews,
      // scores are stored 0-10, the UI shows percentages
      averageScore: s.avgScore != null ? Math.round(s.avgScore * 10) : null,
      bestScore: s.bestScore != null ? Math.round(s.bestScore * 10) : null,
      questionsAnswered: q.questions,
    },
  });
}


export async function updateProfile(req, res) {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const bio = (req.body.bio ?? "").trim();

  if (!name) throw new HttpError(400, "Name is required");
  if (name.length > 100) throw new HttpError(400, "Name is too long");
  if (!email || !EMAIL_RE.test(email)) throw new HttpError(400, "Invalid email address");
  if (bio.length > 500) throw new HttpError(400, "Bio must be 500 characters or fewer");

  const [taken] = await pool.query(
    "SELECT id FROM users WHERE email = ? AND id <> ?",
    [email, req.user.id]
  );
  if (taken.length) throw new HttpError(409, "That email is already in use");

  await pool.query("UPDATE users SET name = ?, email = ?, bio = ? WHERE id = ?", [
    name, email, bio, req.user.id,
  ]);

  res.json({ user: { id: req.user.id, name, email, bio } });
}


export async function updatePreferences(req, res) {
  const [rows] = await pool.query("SELECT preferences FROM users WHERE id = ?", [req.user.id]);
  const current = { ...DEFAULT_PREFS, ...parseJson(rows[0]?.preferences) };

  // Whitelist keys and require booleans, so arbitrary JSON can't be stored
  for (const key of PREF_KEYS) {
    if (key in req.body) {
      if (typeof req.body[key] !== "boolean") throw new HttpError(400, `${key} must be true or false`);
      current[key] = req.body[key];
    }
  }

  await pool.query("UPDATE users SET preferences = ? WHERE id = ?", [
    JSON.stringify(current), req.user.id,
  ]);
  res.json({ preferences: current });
}


export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw new HttpError(400, "Both passwords are required");
  if (newPassword.length < 6) throw new HttpError(400, "New password must be at least 6 characters");
  if (newPassword === currentPassword) throw new HttpError(400, "New password must be different");

  const [rows] = await pool.query("SELECT password_hash FROM users WHERE id = ?", [req.user.id]);
  if (!rows.length) throw new HttpError(404, "User not found");

  const ok = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!ok) throw new HttpError(400, "Current password is incorrect");

  const hash = await bcrypt.hash(newPassword, 10);
  await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, req.user.id]);
  res.json({ message: "Password updated" });
}

/* DELETE /api/profile */
export async function deleteAccount(req, res) {
  const { password } = req.body;
  if (!password) throw new HttpError(400, "Password is required to delete your account");

  const [rows] = await pool.query("SELECT password_hash FROM users WHERE id = ?", [req.user.id]);
  if (!rows.length) throw new HttpError(404, "User not found");

  const ok = await bcrypt.compare(password, rows[0].password_hash);
  if (!ok) throw new HttpError(400, "Password is incorrect");

  // ON DELETE CASCADE removes sessions, questions and answers too
  await pool.query("DELETE FROM users WHERE id = ?", [req.user.id]);
  res.status(204).end();
}