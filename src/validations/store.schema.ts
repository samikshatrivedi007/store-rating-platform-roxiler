import { z } from "zod";
import {createStore} from "../controllers/store.controller";

export const createStoreSchema = z.object({
    name: z
        .string()
        .min(20, "Store name must be  required 20 characters long")
        .max(60, "Store name must be less than 60 characters"),

    email: z
        .email("Invalid email address")
        .optional()
        .or(z.literal("").transform(() => undefined)), // allows empty string as "no email"

    address: z
        .string()
        .max(400, "Address must be less than 400 characters")
        .optional(),

    ownerId: z.number().int().positive().optional(),
});
export const updateStoreSchema = createStoreSchema.partial();

export const listStoresQuerySchema = z.object({
    q: z.string().optional(),
    sortBy: z.string().optional(),
    order: z.enum(["asc", "desc"]).optional(),
});

export const getStoreByIdSchema = z.object({
    id: z.string().regex(/^\d+$/, "Store ID must be a number")
});

export const getStoreRatingsForOwnerSchema = z.object({
    id: z.string().regex(/^\d+$/, "Store ID must be a number")
});
