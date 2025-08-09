import { Request, Response } from "express";
import prisma from "../prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import {Rating, Store} from "../generated/prisma";

type RatingWithUser = Rating & {
    user: {
        id: number;
        name: string;
        email: string;
    };
};


export const listStores = async (req: Request, res: Response) => {
    const { q, sortBy = "name", order = "asc" } = req.query as any;

    const where: any = {};
    if (q) where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } }
    ];

    const stores = await prisma.store.findMany({
        where,
        include: { ratings: true },
        orderBy: { [sortBy]: order.toLowerCase() === "asc" ? "asc" : "desc" }
    });

    const result = await Promise.all(stores.map(async (s: Store)  => {
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
};

export const createStore = async (req: Request, res: Response) => {
    const { name, email, address, ownerId } = req.body;
    if (!name) return res.status(400).json({ message: "name required" });
    const store = await prisma.store.create({ data: { name, email, address, ownerId }});
    res.status(201).json(store);
};

export const getStoreById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const store = await prisma.store.findUnique({ where: { id }, include: { ratings: { include: { user: { select: { id: true, name: true, email: true }}}}}});
    if (!store) return res.status(404).json({ message: "Store not found" });

    const avg = await prisma.rating.aggregate({ where: { storeId: id }, _avg: { value: true }, _count: { value: true }});
    return res.json({
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        overallRating: avg._avg.value ? Number(avg._avg.value.toFixed(1)) : null,
        ratingsCount: avg._count.value
    });
};

export const getStoreRatingsForOwner = async (req: AuthRequest, res: Response) => {
    const storeId = Number(req.params.id);
    const store = await prisma.store.findUnique({ where: { id: storeId }, include: { ratings: { include: { user: { select: { id: true, name: true, email: true }}}}}});
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
    }))as RatingWithUser[];

    const avg = ratings.length
        ? ratings.reduce((sum: number, r: RatingWithUser) => sum + r.value, 0) / ratings.length
        : null;

    res.json({
        ratings,
        averageRating: avg !== null ? Number(avg.toFixed(1)) : null
    });
}
