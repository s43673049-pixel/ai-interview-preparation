import { Router } from "express";
import {
  createSession, submitAnswer, completeSession,
  listSessions, getSession, deleteSession,
} from "../controllers/interview.controller.js";
import { authenticate } from "../middleware/auth.js";
import { aiLimiter } from "../middleware/rateLimit.js";
import { asyncHandler } from "../utils/asynchandler.js";

const router = Router();

router.use(authenticate);

router.get("/sessions", asyncHandler(listSessions));
router.post("/sessions", aiLimiter, asyncHandler(createSession));
router.get("/sessions/:sessionId", asyncHandler(getSession));
router.post("/sessions/:sessionId/complete", asyncHandler(completeSession));
router.delete("/sessions/:sessionId", asyncHandler(deleteSession));

router.post("/questions/:questionId/answer", aiLimiter, asyncHandler(submitAnswer));

export default router;