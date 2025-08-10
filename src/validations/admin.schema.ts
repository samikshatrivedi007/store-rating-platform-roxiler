import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const adminDashboardQuerySchema = z.object({
    dateFrom: z
        .string()
        .regex(dateRegex, "dateFrom must be in YYYY-MM-DD format")
        .optional(),
    dateTo: z
        .string()
        .regex(dateRegex, "dateTo must be in YYYY-MM-DD format")
        .optional()
});
