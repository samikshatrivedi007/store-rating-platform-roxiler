import { Router } from "express";
import { register, login } from "../controllers/auth.controller";

const router = Router();

router.post("/register", register); // register normal user or admin (admin route only for admin in real app)
router.post("/login", login);

export default router;
