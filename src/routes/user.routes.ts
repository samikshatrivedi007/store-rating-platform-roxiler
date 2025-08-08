import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { getProfile, updatePassword, listUsers, getUserById } from "../controllers/user.controller";

const router = Router();

router.get("/me", authMiddleware, getProfile);
router.put("/me/password", authMiddleware, updatePassword);

// Admin-only endpoints
router.get("/", authMiddleware, requireRole(["ADMIN"]), listUsers);
router.get("/:id", authMiddleware, requireRole(["ADMIN"]), getUserById);

export default router;
