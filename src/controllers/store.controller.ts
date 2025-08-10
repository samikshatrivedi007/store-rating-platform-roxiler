import { Request, Response } from "express";
import prisma from "../prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Rating, Store } from "../generated/prisma";
import {
    createStoreSchema,
    getStoreByIdSchema,
    getStoreRatingsForOwnerSchema,
    listStoresQuerySchema
} from "../validations/store.schema";

type RatingWithUser = Rating & {
    user: {
        id: number;
        name: string;
        email: string;
    };
};

export const listStores = async (req: Request, res: Response) => {
    const queryResult = listStoresQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
        return res.status(400).json({ errors: queryResult.error.issues });
    }

    try {
        const { q, sortBy = "name", order = "asc" } = req.query as any;

        const where: any = {};
        if (q) {
            where.OR = [
                { name: { contains: q, mode: "insensitive" } },
                { address: { contains: q, mode: "insensitive" } }
            ];
        }

        const stores = await prisma.store.findMany({
            where,
            include: { ratings: true },
            orderBy: { [sortBy]: order.toLowerCase() === "asc" ? "asc" : "desc" }
        });

        const result = await Promise.all(stores.map(async (s: Store) => {
            const avg = await prisma.rating.aggregate({
                where: { storeId: s.id },
                _avg: { value: true },
                _count: { value: true }
            });
            return {
                id: s.id,
                name: s.name,
                email: s.email,
                address: s.address,
                overallRating: avg._avg.value ? Number(avg._avg.value.toFixed(1)) : null,
                ratingsCount: avg._count.value
            };
        }));

        res.json(result);
    } catch (error: any) {
        console.error("List Stores Error:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message || error });
    }
};

export const createStore = async (req: Request, res: Response) => {
    const result = createStoreSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Validation error",
            errors: result.error.issues,
        });
    }
    try {
        const { name, email, address, ownerId } = req.body;
        if (!name) return res.status(400).json({ message: "name required" });
        const store = await prisma.store.create({ data: { name, email, address, ownerId } });
        res.status(201).json(store);
    } catch (error: any) {
        console.error("Create Store Error:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message || error });
    }
};

export const getStoreById = async (req: Request, res: Response) => {
    const paramCheck = getStoreByIdSchema.safeParse(req.params);
    if (!paramCheck.success) {
        return res.status(400).json({
            message: "Validation error",
            errors: paramCheck.error.issues
        });
    }
    try {
        const id = Number(req.params.id);
        const store = await prisma.store.findUnique({
            where: { id },
            include: { ratings: { include: { user: { select: { id: true, name: true, email: true } } } } }
        });
        if (!store) return res.status(404).json({ message: "Store not found" });

        const avg = await prisma.rating.aggregate({
            where: { storeId: id },
            _avg: { value: true },
            _count: { value: true }
        });

        return res.json({
            id: store.id,
            name: store.name,
            email: store.email,
            address: store.address,
            overallRating: avg._avg.value ? Number(avg._avg.value.toFixed(1)) : null,
            ratingsCount: avg._count.value
        });
    } catch (error: any) {
        console.error("Get Store By ID Error:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message || error });
    }
};

export const getStoreRatingsForOwner = async (req: AuthRequest, res: Response) => {
    const paramCheck = getStoreRatingsForOwnerSchema.safeParse(req.params);
    if (!paramCheck.success) {
        return res.status(400).json({
            message: "Validation error",
            errors: paramCheck.error.issues });
    }

    try {
        const storeId = Number(req.params.id);
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            include: { ratings: { include: { user: { select: { id: true, name: true, email: true } } } } }
        });
        if (!store) return res.status(404).json({ message: "Store not found" });

        // Optionally check owner:
        if (store.ownerId && store.ownerId !== req.user!.id && req.user!.role !== "ADMIN") {
            return res.status(403).json({ message: "Forbidden" });
        }

        const ratings = store.ratings.map((r: RatingWithUser) => ({
            id: r.id,
            value: r.value,
            user: {
                id: r.user.id,
                name: r.user.name,
                email: r.user.email,
            },
            createdAt: r.createdAt,
        })) as RatingWithUser[];

        const avg = ratings.length
            ? ratings.reduce((sum: number, r: RatingWithUser) => sum + r.value, 0) / ratings.length
            : null;

        res.json({
            ratings,
            averageRating: avg !== null ? Number(avg.toFixed(1)) : null
        });
    } catch (error: any) {
        console.error("Get Store Ratings For Owner Error:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message || error });
    }
};
