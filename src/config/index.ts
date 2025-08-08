import dotenv from "dotenv";
dotenv.config();

export default {
    port: process.env.PORT || 4000,
    jwtSecret: process.env.JWT_SECRET || "secret",
    db: {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 3306),
        username: process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "store_rating_db"
    }
};
