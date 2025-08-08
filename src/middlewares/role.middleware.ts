import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const requireRole = (roles: Array<"ADMIN" | "USER" | "STORE_OWNER">) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });
        if (!roles.includes(req.user.role as any)) return res.status(403).json({ message: "Forbidden" });
        next();
    };
};
