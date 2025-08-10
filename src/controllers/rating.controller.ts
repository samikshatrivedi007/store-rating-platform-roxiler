// src/controllers/rating.controller.ts
import { Request, Response } from "express";
import prisma from "../prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import {createOrUpdateRatingSchema, getMyRatingForStoreSchema} from "../validations/rating.schema";

export const createOrUpdateRating = async (req: AuthRequest, res: Response) => {
    const validation = createOrUpdateRatingSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            message: "Validation error",
            errors: validation.error.issues
        });
    }
    try {
        const { storeId, value } = req.body;
        const userId = req.user!.id;

        if (!storeId || ![1, 2, 3, 4, 5].includes(value)) {
            return res.status(400).json({ message: "storeId and value(1-5) required" });
        }

        const store = await prisma.store.findUnique({ where: { id: storeId } });
        if (!store) return res.status(404).json({ message: "Store not found" });

        const existing = await prisma.rating.findFirst({ where: { storeId, userId } });
        if (existing) {
            const updated = await prisma.rating.update({ where: { id: existing.id }, data: { value } });
            return res.json({ message: "Rating updated", rating: updated });
        } else {
            const created = await prisma.rating.create({ data: { value, storeId, userId } });
            return res.status(201).json({ message: "Rating created", rating: created });
        }
    } catch (error: any) {
        console.error("Create/Update Rating Error:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message || error });
    }
};

export const getMyRatingForStore = async (req: AuthRequest, res: Response) => {
    const validation = getMyRatingForStoreSchema.safeParse(req.params);
    if (!validation.success) {
        return res.status(400).json({
            message: "Validation error",
            errors: validation.error.issues
        });
    }
    try {
        const storeId = Number(req.params.storeId);
        const userId = req.user!.id;
        const rating = await prisma.rating.findFirst({ where: { storeId, userId } });
        res.json({ rating });
    } catch (error: any) {
        console.error("Get My Rating Error:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message || error });
    }
};
