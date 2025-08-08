import { Request, Response } from "express";
import { User } from "../models/user.model";
import { AuthRequest } from "../middlewares/auth.middleware";
import { hashPassword, comparePasswords } from "../utils/hash";
import { nameValid, passwordValid } from "../utils/validators";
import {AppDataSource} from "../data-source";

export const getProfile = async (req: AuthRequest, res: Response) => {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ message: "Not found" });
    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
    });
};

export const updatePassword = async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "currentPassword and newPassword required" });
    if (!passwordValid(newPassword)) return res.status(400).json({ message: "Password must be 8-16 chars, include uppercase and special char." });

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ message: "Not found" });

    const ok = await comparePasswords(currentPassword, user.password);
    if (!ok) return res.status(400).json({ message: "Current password incorrect" });

    user.password = await hashPassword(newPassword);
    await userRepo.save(user);
    return res.json({ message: "Password updated" });
};

//Admin endpoints

export const listUsers = async (req: Request, res: Response) => {
    const { sortBy = "name", order = "ASC", role, q } = req.query as any;
    const userRepo = AppDataSource.getRepository(User);

    const qb = userRepo.createQueryBuilder("user");

    if (role) qb.andWhere("user.role = :role", { role });
    if (q) {
        qb.andWhere("(user.name LIKE :q OR user.email LIKE :q OR user.address LIKE :q)", { q: `%${q}%` });
    }

    qb.orderBy(`user.${sortBy}`, (order as "ASC" | "DESC") || "ASC");

    const users = await qb.getMany();
    const mapped = users.map(u => ({ id: u.id, name: u.name, email: u.email, address: u.address, role: u.role }));
    res.json(mapped);
};

export const getUserById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id },  relations: ["ratings"] });
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
