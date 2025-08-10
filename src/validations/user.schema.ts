import { z } from "zod";

export const registerSchema = z.object({
    name: z.string()
        .min(20, "Name must contain at least 20 characters")
        .max(60, "Name must be not more than 60 characters"),
    email: z.string().email("Invalid email address"),
    address: z.string().max(400, "Address must be not more than 400 characters").optional(),
    role: z.enum(["ADMIN", "STORE_OWNER", "CUSTOMER"]),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(16, "Password must be not more than 16 characters"),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(16, "Password must be not more than 16 characters"),
});
