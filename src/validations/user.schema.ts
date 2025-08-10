import { z } from "zod";
import { Role } from "../prisma/client"; // Prisma-generated enum

export const registerSchema = z.object({
    name: z.string()
        .min(20, "Name must contain at least 20 characters")
        .max(60, "Name must be not more than 60 characters"),
    email: z.email("Invalid email address"),
    address: z.string().max(400, "Address must be not more than 400 characters").optional(),
    role: z.enum(["ADMIN", "STORE_OWNER", "CUSTOMER"]),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(16, "Password must be not more than 16 characters"),
});

export const loginSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(16, "Password must be not more than 16 characters"),
});

export const updatePasswordSchema = z.object({
    currentPassword: z.string()
        .min(1, "Current password is required.")
        .max(16, "Password must be less than 16 characters"),
    newPassword: z.string()
        .min(8, "Password must be at least 8 characters.")
        .max(16, "Password must be at most 16 characters.")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character.")
});

export const listUsersQuerySchema = z.object({
    sortBy: z.enum(["name", "email", "address", "role"]).optional(),
    order: z.enum(["asc", "desc", "ASC", "DESC"]).optional(),
    role: z.enum(Role).optional(),
    q: z.string().optional()
});

export const getUserByIdParamsSchema = z.object({
    id: z.string()
        .regex(/^\d+$/, "ID must be a number.")
});

