// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export interface AuthRequest extends Request {
    user?: { id: number; role: string; email?: string; name?: string };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized" });
    const token = header.split(" ")[1];

    try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        // fetch user from DB to ensure still valid and get fresh role
        const user = await prisma.user.findUnique({ where: { id: payload.id } });
        if (!user) return res.status(401).json({ message: "Unauthorized" });

        req.user = { id: user.id, role: user.role, email: user.email, name: user.name };
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
