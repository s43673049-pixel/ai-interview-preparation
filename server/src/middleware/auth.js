import jwt from "jsonwebtoken";
import { HttpError } from "../utils/HttpError.js";

export function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new HttpError(401, "No token provided"));
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token"));
  }
}