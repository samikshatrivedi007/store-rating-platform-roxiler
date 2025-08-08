import { Router } from "express";
import { listStores, createStore, getStoreById, getStoreRatingsForOwner } from "../controllers/store.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

// Public: list and search
router.get("/", authMiddleware, listStores);

// Admin: create store
router.post("/", authMiddleware, requireRole(["ADMIN"]), createStore);

// Details
router.get("/:id", authMiddleware, getStoreById);

// Store owner: view users who rated their store
router.get("/:id/ratings", authMiddleware, requireRole(["STORE_OWNER", "ADMIN"]), getStoreRatingsForOwner);

export default router;
