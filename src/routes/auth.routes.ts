import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import {loginBodySchema} from "../validations/user.schema";

const router = Router();
router.post("/register", register);
router.post("/login", login);

export default router;
