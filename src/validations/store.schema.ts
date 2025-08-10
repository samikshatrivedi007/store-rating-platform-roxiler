import { z } from "zod";

export const storeSchema = z.object({
    name: z
        .string()
        .min(20, "Store name is required")
        .max(60, "Store name must be less than 100 characters"),

    email: z
        .string()
        .email("Invalid email address")
        .optional()
        .or(z.literal("").transform(() => undefined)), // allows empty string as "no email"

    address: z
        .string()
        .max(400, "Address must be less than 255 characters")
        .optional(),

    ownerId: z.number().int().positive().optional(),
});
