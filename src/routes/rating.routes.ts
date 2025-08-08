import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createOrUpdateRating, getMyRatingForStore } from "../controllers/rating.controller";

const router = Router();

router.post("/", authMiddleware, createOrUpdateRating); // body: { storeId, value }
router.get("/store/:storeId/me", authMiddleware, getMyRatingForStore);

export default router;
