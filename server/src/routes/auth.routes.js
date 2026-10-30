import { Router } from "express";
import { register, login, me } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { asyncHandler } from "../utils/asynchandler.js";

const router = Router();

router.post("/register", authLimiter, asyncHandler(register));
router.post("/login", authLimiter, asyncHandler(login));
router.get("/me", authenticate, asyncHandler(me));

export default router;