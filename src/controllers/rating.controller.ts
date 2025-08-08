import { AuthRequest } from "../middlewares/auth.middleware";
import { Request, Response } from "express";
import { Rating } from "../models/rating.model";
import { Store } from "../models/store.model";
import { User } from "../models/user.model";
import {AppDataSource} from "../data-source";

export const createOrUpdateRating = async (req: AuthRequest, res: Response) => {
    const { storeId, value } = req.body;
    const userId = req.user!.id;

    if (!storeId || ![1,2,3,4,5].includes(value)) return res.status(400).json({ message: "storeId and value(1-5) required" });

    const ratingRepo = AppDataSource.getRepository(Rating);
    const storeRepo = AppDataSource.getRepository(Store);
    const userRepo = AppDataSource.getRepository(User);

    const store = await storeRepo.findOne(storeId);
    if (!store) return res.status(404).json({ message: "Store not found" });

    const user = await userRepo.findOne({  where: { id: userId }});
    if (!user) return res.status(404).json({ message: "User not found" });

    let rating = await ratingRepo.findOne({ where: { store: { id: storeId }, user: { id: userId } }, relations: ["user","store"] as any });
    if (rating) {
        rating.value = value;
        await ratingRepo.save(rating);
        return res.json({ message: "Rating updated", rating });
    } else {
        rating = ratingRepo.create({ value, store, user });
        await ratingRepo.save(rating);
        return res.status(201).json({ message: "Rating created", rating });
    }
};

export const getMyRatingForStore = async (req: AuthRequest, res: Response) => {
    const storeId = Number(req.params.storeId);
    const userId = req.user!.id;
    const ratingRepo = AppDataSource.getRepository(Rating);
    const rating = await ratingRepo.findOne({ where: { store: { id: storeId }, user: { id: userId } }, relations: ["user","store"] as any });
    if (!rating) return res.json({ rating: null });
    return res.json({ rating });
};
