import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    console.error("Error:", err);

    // Zod validation errors
    if (err instanceof ZodError) {
        return res.status(400).json({
            message: "Validation failed",
            errors: err.issues,
        });
    }

    // If the error has a custom status property
    if (
        typeof err === "object" &&
        err !== null &&
        "status" in err &&
        typeof (err as any).status === "number"
    ) {
        return res.status((err as any).status).json({
            message: (err as any).message || "Error",
        });
    }

    // Prisma or database-related errors
    if (typeof err === "object" && err !== null && "code" in err) {
        return res.status(500).json({
            message: "Database error",
            code: (err as any).code,
        });
    }

    // Fallback for generic Error objects
    if (err instanceof Error) {
        return res.status(500).json({
            message: err.message,
            name: err.name,
        });
    }

    // Final fallback
    return res.status(500).json({
        message: "Internal server error",
    });
}
