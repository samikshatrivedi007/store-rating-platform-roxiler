import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import app from "./app";
import {errorHandler} from "./middlewares/errorHandler";

dotenv.config();

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Test DB connection before starting server
async function startServer() {
    try {
        await prisma.$connect();
        console.log("✅ Database connected successfully");

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to connect to database:", error);
        process.exit(1);
    }
}
app.use(errorHandler);
startServer();
