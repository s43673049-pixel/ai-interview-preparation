import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import { HttpError } from "../utils/HttpError.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email || !password) throw new HttpError(400, "Name, email and password are required");
  if (!EMAIL_RE.test(email)) throw new HttpError(400, "Invalid email address");
  if (password.length < 6) throw new HttpError(400, "Password must be at least 6 characters");

  const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
  if (existing.length) throw new HttpError(409, "Email already registered");

  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    [name.trim(), email.toLowerCase(), hash]
  );

  const user = { id: result.insertId, name: name.trim(), email: email.toLowerCase() };
  res.status(201).json({ token: signToken(user), user });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) throw new HttpError(400, "Email and password are required");

  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email.toLowerCase()]);
  const row = rows[0];

  // Same message for unknown email and wrong password
  if (!row || !(await bcrypt.compare(password, row.password_hash))) {
    throw new HttpError(401, "Invalid credentials");
  }

  const user = { id: row.id, name: row.name, email: row.email };
  res.json({ token: signToken(user), user });
}

export async function me(req, res) {
  const [rows] = await pool.query("SELECT id, name, email FROM users WHERE id = ?", [req.user.id]);
  if (!rows.length) throw new HttpError(404, "User not found");
  res.json(rows[0]);
}