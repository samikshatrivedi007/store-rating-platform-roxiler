import { z } from "zod";

export const createOrUpdateRatingSchema = z.object({
    storeId: z.number()
        .int("storeId must be an integer")
        .positive("storeId must be a positive integer"),
    value: z.number()
        .int("Value must be an integer")
        .min(1, "Value must be between 1 and 5")
        .max(5, "Value must be between 1 and 5")
});

export const getMyRatingForStoreSchema = z.object({
    storeId: z.string()
        .regex(/^\d+$/, "storeId must be a number")
});
