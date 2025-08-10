import { z } from "zod";

export const ratingSchema = z.object({
    value: z
        .number()
        .int("Rating must be an integer")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating must be at most 5"),

    userId: z
        .number()
        .int("User ID must be an integer")
        .positive("User ID must be positive"),

    storeId: z
        .number()
        .min(1, "Store ID must be an integer")
        .positive("Store ID must be positive"),
});
