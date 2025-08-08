import { Request, Response } from "express";
import { User } from "../models/user.model";
import { hashPassword, comparePasswords } from "../utils/hash";
import jwt from "jsonwebtoken";
import config from "../config";
import { nameValid, passwordValid, emailValid, addressValid } from "../utils/validators";
import {AppDataSource} from "../data-source";

/**
 * register - normal user signup
 * Accepts: { name, email, address, password, role? }
 */
export const register = async (req: Request, res: Response) => {
    const { name, email, address, password, role } = req.body;
    if (!nameValid(name)) return res.status(400).json({ message: "Name must be 20-60 characters." });
    if (!emailValid(email)) return res.status(400).json({ message: "Invalid email." });
    if (!addressValid(address)) return res.status(400).json({ message: "Address too long." });
    if (!passwordValid(password)) return res.status(400).json({ message: "Password must be 8-16 chars, include uppercase and special char." });

    const userRepo = AppDataSource.getRepository(User);
    const existing = await userRepo.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email already registered." });

    const hashed = await hashPassword(password);
    const user = userRepo.create({
        name,
        email,
        address,
        password: hashed,
        role: role === "ADMIN" ? "ADMIN" : role === "STORE_OWNER" ? "STORE_OWNER" : "USER"
    });

    await userRepo.save(user);

    return res.status(201).json({ message: "User created", user: { id: user.id, name: user.name, email: user.email, role: user.role } });
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required." });

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials." });

    const ok = await comparePasswords(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials." });

    const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: "7d" });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
};
