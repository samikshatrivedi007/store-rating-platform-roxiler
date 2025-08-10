// src/controllers/admin.controller.ts
import { Request, Response } from "express";
import prisma from "../prisma";

export const adminDashboard = async (_req: Request, res: Response) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalStores = await prisma.store.count();
        const totalRatings = await prisma.rating.count();

        res.json({ totalUsers, totalStores, totalRatings });
    } catch (error: any) {
        console.error("Admin Dashboard Error:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message || error });
    }
};
