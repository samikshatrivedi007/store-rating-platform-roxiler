import { z } from "zod";

export const
    loginBodySchema = z.object({
    name: z.string()
        .min(20, "Name must contain at least 20 characters")
        .max(60,"Name must be not no more than 60 characters"),
    email: z.email("Invalid email address"),
    address: z.string()
        .max(400,"address must be not more than 400 characters"),
    role: z.enum(["ADMIN", "STORE_OWNER", "CUSTOMER"]),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(16,"Password must be not more than 12 characters"),

});

export const updateUserSchema =
    loginBodySchema.partial();
