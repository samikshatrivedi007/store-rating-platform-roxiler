import {NextFunction, Request, Response} from "express";
import prisma from "../prisma";
import { Role } from "../prisma/client";

import { AuthRequest } from "../middlewares/auth.middleware";
import { hashPassword, comparePasswords } from "../utils/hash";
import { passwordValid } from "../utils/validators";
import { User } from "../generated/prisma";
import {getUserByIdParamsSchema, listUsersQuerySchema, updatePasswordSchema} from "../validations/user.schema";

export const getProfile = async (req: AuthRequest, res: Response,next:NextFunction) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: { id: true, name: true, email: true, address: true, role: true }
        });
        if (!user) return res.status(404).json({ message: "Not found" });
        res.json(user);
    }  catch (error) {
        console.error(error);
        next(error);
    }

};

// Update password function
export const updatePassword = async (req: AuthRequest, res: Response,next:NextFunction) => {
    const parseResult = updatePasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({
            errors: parseResult.error.issues
        });
    }
    const { currentPassword, newPassword } = parseResult.data;
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Both currentPassword and newPassword are required." });
        }

        if (!passwordValid(newPassword)) {
            return res.status(400).json({
                message: "Password must be 8-16 chars, include uppercase and special character."
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user?.id }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const isMatch = await comparePasswords(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect." });
        }

        const hashedPassword = await hashPassword(newPassword);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        return res.json({ message: "Password updated successfully." });

    }  catch (error) {
        console.error(error);
        next(error);
    }

};

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
    const parseResult = listUsersQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
        return res.status(400).json({ errors: parseResult.error.issues });
    }

    const { sortBy = "name", order = "asc", role, q } = parseResult.data;

    try {
        const users = await prisma.user.findMany({
            where: {
                ...(role ? { role: role as Role } : {}),
                ...(q ? {
                    OR: [
                        { name: { contains: q, mode: "insensitive" } },
                        { email: { contains: q, mode: "insensitive" } },
                        { address: { contains: q, mode: "insensitive" } }
                    ]
                } : {})
            },
            orderBy: { [sortBy]: order.toLowerCase() === "asc" ? "asc" : "desc" }
        });

        res.json(users.map((u: User) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            address: u.address,
            role: u.role
        })));
    } catch (error) {
        console.error(error);
        next(error);
    }
};


export const getUserById = async (req: Request, res: Response ,next:NextFunction) => {
    const parseResult = getUserByIdParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
        return res.status(400).json({ errors: parseResult.error.issues });
    }

    const id = Number(parseResult.data.id);
    try {
        const id = Number(req.params.id);
        const user = await prisma.user.findUnique({
            where: { id },
            include: { ratings: true }
        });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address,
            role: user.role,
            ratings: user.role === "STORE_OWNER" ? user.ratings : undefined
        });
    }  catch (error) {
        console.error(error);
        next(error);
    }

};
