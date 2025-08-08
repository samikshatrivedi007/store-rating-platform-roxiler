import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Store } from "../models/store.model";
import { Rating } from "../models/rating.model";
import {AppDataSource} from "../data-source";

/**
 * Dashboard:
 * - total number of users
 * - total number of stores
 * - total number of submitted ratings
 */
export const adminDashboard = async (req: Request, res: Response) => {
    const userCount = await AppDataSource.getRepository(User).count();
    const storeCount = await AppDataSource.getRepository(Store).count();
    const ratingCount = await AppDataSource.getRepository(Rating).count();

    res.json({
        totalUsers: userCount,
        totalStores: storeCount,
        totalRatings: ratingCount
    });
};
