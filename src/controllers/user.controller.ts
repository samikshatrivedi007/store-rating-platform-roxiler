// src/controllers/user.controller.ts
import { Request, Response } from "express";
import prisma from "../prisma";

import { AuthRequest } from "../middlewares/auth.middleware";
import { hashPassword, comparePasswords } from "../utils/hash";
import { passwordValid } from "../utils/validators";
import {User} from "../generated/prisma";

export const getProfile = async (req: AuthRequest, res: Response) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, name: true, email: true, address: true, role: true }});
    if (!user) return res.status(404).json({ message: "Not found" });
    res.json(user);
};

// Update password function
export const updatePassword = async (req: AuthRequest, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // 1. Check input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Both currentPassword and newPassword are required." });
        }

        // 2. Validate new password format
        if (!passwordValid(newPassword)) {
            return res.status(400).json({
                message: "Password must be 8-16 chars, include uppercase and special character."
            });
        }

        // 3. Get logged-in user from token
        const user = await prisma.user.findUnique({
            where: { id: req.user?.id }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // 4. Compare current password with DB hash
        const isMatch = await comparePasswords(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect." });
        }

        // 5. Hash and update new password
        const hashedPassword = await hashPassword(newPassword);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        // 6. Success
        return res.json({ message: "Password updated successfully." });

    } catch (error) {
        console.error("Error updating password:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};


export const listUsers = async (req: Request, res: Response) => {
    const { sortBy = "name", order = "asc", role, q } = req.query as any;
    const where: any = {};

    if (role) where.role = role;
    if (q) where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } }
    ];

    const users = await prisma.user.findMany({
        where,
        orderBy: { [sortBy]: order.toLowerCase() === "asc" ? "asc" : "desc" }
    });

    res.json(users.map((u: User) => ({ id: u.id, name: u.name, email: u.email, address: u.address, role: u.role })));
};

export const getUserById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({ where: { id }, include: { ratings: true }});
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        ratings: user.role === "STORE_OWNER" ? user.ratings : undefined
    });
};
