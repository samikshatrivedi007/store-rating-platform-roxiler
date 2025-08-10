import { Request, Response } from "express";
import prisma from "../prisma";
import {adminDashboardQuerySchema} from "../validations/admin.schema";

export const adminDashboard = async (req: Request, res: Response) => {
        const parsed = adminDashboardQuerySchema.safeParse(req.query);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.issues });
        }
    try {
        const totalUsers = await prisma.user.count();
        const totalStores = await prisma.store.count();
        const totalRatings = await prisma.rating.count();

        res.json({ totalUsers, totalStores, totalRatings });
    } catch (error: any) {
        console.error("Admin Dashboard Error:", error);
        res.status(500).json({message: "Internal server error.", error: error.message || error});

    }

};