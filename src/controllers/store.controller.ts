import { Request, Response } from "express";
import { Store } from "../models/store.model";
import { AppDataSource } from "../data-source";
import { AuthRequest } from "../middlewares/auth.middleware";

export const listStores = async (req: Request, res: Response) => {
    const { q, sortBy = "name", order = "ASC" } = req.query as any;
    const storeRepo = AppDataSource.getRepository(Store);
    const qb = storeRepo.createQueryBuilder("store").leftJoinAndSelect("store.ratings", "rating");

    if (q) qb.andWhere("(store.name LIKE :q OR store.address LIKE :q)", { q: `%${q}%` });

    qb.orderBy(`store.${sortBy}`, (order as "ASC" | "DESC") || "ASC");

    const stores = await qb.getMany();

    // compute overall rating and also user's submitted rating (client will pass user id via auth)
    const result = stores.map(s => {
        const ratings = s.ratings || [];
        const overall = ratings.length ? Math.round((ratings.reduce((a, r) => a + r.value, 0) / ratings.length) * 10) / 10 : null;
        return {
            id: s.id,
            name: s.name,
            email: s.email,
            address: s.address,
            overallRating: overall
        };
    });
    res.json(result);
};

export const createStore = async (req: Request, res: Response) => {
    const { name, email, address } = req.body;
    if (!name || !email) return res.status(400).json({ message: "name and email required" });
    const storeRepo = AppDataSource.getRepository(Store);
    const exist = await storeRepo.findOne({ where: { email } });
    if (exist) return res.status(400).json({ message: "Store with this email exists" });

    const store = storeRepo.create({ name, email, address });
    await storeRepo.save(store);
    res.status(201).json(store);
};

export const getStoreById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const storeRepo = AppDataSource.getRepository(Store);
    const store = await storeRepo.findOne({  where : {id},  relations: ["ratings", "ratings.user"] });
    if (!store) return res.status(404).json({ message: "Store not found" });

    const overall = store.ratings.length ? Math.round((store.ratings.reduce((a, r) => a + r.value, 0) / store.ratings.length) * 10) / 10 : null;
    res.json({
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        overallRating: overall,
        ratingsCount: store.ratings.length
    });
};

export const getStoreRatingsForOwner = async (req: AuthRequest, res: Response) => {
    const storeId = Number(req.params.id);
    const storeRepo = AppDataSource.getRepository(Store);
    const store = await storeRepo.findOne({ where: { id: storeId },  relations: ["ratings", "ratings.user"] });
    if (!store) return res.status(404).json({ message: "Store not found" });

    // In a real app, check that req.user is owner of store; for now allow STORE_OWNER role or ADMIN
    const ratings = store.ratings.map(r => ({
        id: r.id,
        value: r.value,
        user: { id: r.user.id, name: r.user.name, email: r.user.email },
        createdAt: r.createdAt
    }));
    const avg = ratings.length ? Math.round((ratings.reduce((a, r) => a + r.value, 0) / ratings.length) * 10) / 10 : null;
    res.json({ ratings, averageRating: avg });
};
