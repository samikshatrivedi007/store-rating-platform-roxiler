import { Request, Response } from "express";
import prisma from "../prisma";
import { hashPassword, comparePasswords } from "../utils/hash";
import jwt from "jsonwebtoken";
import { nameValid, passwordValid, emailValid, addressValid } from "../utils/validators";
import { registerSchema,loginSchema} from "../validations/user.schema";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export const register = async (req: Request, res: Response) => {

    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
        // Zod error format
        return res.status(400).json({
            message: "Validation error",
            errors: result.error.issues
        });
    }
    try {
        const { name, email, address, password, role } = req.body;
        if (!nameValid(name)) return res.status(400).json({ message: "Name must be 20-60 characters." });
        if (!emailValid(email)) return res.status(400).json({ message: "Invalid email." });
        if (!addressValid(address)) return res.status(400).json({ message: "Address too long." });
        if (!passwordValid(password)) return res.status(400).json({ message: "Password must be 8-16 chars, include uppercase and special char." });

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ message: "Email already registered." });

        const hashed = await hashPassword(password);

        const normalizedRole = (role || "").toUpperCase();

        const createdUser = await prisma.user.create({
            data: {
                name,
                email,
                address,
                password: hashed,
                role: normalizedRole === "ADMIN"
                    ? "ADMIN"
                    : normalizedRole === "STORE_OWNER"
                        ? "STORE_OWNER"
                        : "USER"
            },
            select: { id: true, name: true, email: true, role: true }
        });

        return res.status(201).json({ message: "User created", user: createdUser });
    } catch (error: any) {
        console.error("Register Error:", error);
        return res.status(500).json({ message: "Internal server error.", error: error.message || error });
    }
};

export const login = async (req: Request, res: Response) => {

    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        // Zod error format
        return res.status(400).json({
            message: "Validation error",
            errors: result.error.issues
        });
    }

    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Email and password required." });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ message: "Invalid credentials." });

        const ok = await comparePasswords(password, user.password);
        if (!ok) return res.status(400).json({ message: "Invalid credentials." });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
        return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error: any) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Internal server error.", error: error.message || error });
    }
};
