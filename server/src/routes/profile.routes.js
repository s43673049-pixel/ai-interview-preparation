import { Router } from "express";
import {
  getProfile, updateProfile, updatePreferences, changePassword, deleteAccount,
} from "../controllers/profile.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.use(authenticate);

router.get("/", asyncHandler(getProfile));
router.put("/", asyncHandler(updateProfile));
router.put("/preferences", asyncHandler(updatePreferences));

// Password-sensitive routes get the stricter limiter
router.put("/password", authLimiter, asyncHandler(changePassword));
router.delete("/", authLimiter, asyncHandler(deleteAccount));

export default router;