import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { adminDashboard } from "../controllers/admin.controller";

const router = Router();

router.get("/dashboard", authMiddleware, requireRole(["ADMIN"]), adminDashboard);

export default router;
