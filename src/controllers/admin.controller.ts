import {NextFunction, Request, Response} from "express";
import prisma from "../prisma";
import {adminDashboardQuerySchema} from "../validations/admin.schema";

export const adminDashboard = async (req: Request, res: Response,next:NextFunction) => {
        const parsed = adminDashboardQuerySchema.safeParse(req.query);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.issues });
        }
    try {
        const totalUsers = await prisma.user.count();
        const totalStores = await prisma.store.count();
        const totalRatings = await prisma.rating.count();

        res.json({ totalUsers, totalStores, totalRatings });
    }catch (error) {
        console.error(error);
        next(error);
    }


};