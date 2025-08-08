import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { User } from "../models/user.model";
import {AppDataSource} from "../data-source";

export interface AuthRequest extends Request {
    user?: Partial<User>;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized" });
    const token = header.split(" ")[1];
    try {
        const payload = jwt.verify(token, config.jwtSecret) as any;
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne(payload.id);
        if (!user) return res.status(401).json({ message: "Unauthorized" });
        req.user = { id: user.id, role: user.role, email: user.email, name: user.name };
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
