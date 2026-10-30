import { HttpError } from "../utils/HttpError.js";

export function notFound(req, res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  // AI service (FastAPI) failures
  if (err.isAxiosError) {
    const detail = err.response?.data?.detail || err.message;
    console.error("AI service error:", detail);
    return res.status(502).json({ error: "AI service unavailable, please try again" });
  }

  const status = err.status || 500;
  if (status === 500) console.error(err);

  res.status(status).json({
    error: status === 500 ? "Internal server error" : err.message,
  });
}