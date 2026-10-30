import rateLimit from "express-rate-limit";

// General API limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limit for login/register to slow brute force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many attempts, try again later" },
});

// LLM calls are slow and cost money, so limit them per IP
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Slow down, too many AI requests" },
});