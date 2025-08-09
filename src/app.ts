import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import storeRoutes from "./routes/store.routes";
import ratingRoutes from "./routes/rating.routes";
import adminRoutes from "./routes/admin.routes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/admin", adminRoutes);

// Root route
app.get("/", (_req, res) => {
    res.send("🚀 API is running...");
});

export default app;
