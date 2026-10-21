import express from "express";
import helmet from "helmet";
import authRouter from "./routes/auth.js";
import cors from "cors";
import { pool } from "./db/pool.js";
import { logger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";
const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "10kb" }));
if (process.env.NODE_ENV !== "test") app.use(logger);
app.get("/", (req, res) => res.send("АгроМаркет API работает"));
app.get("/api/health", async (req, res) => {
  await pool.query("SELECT 1");
  res.json({ status: "ok", db: "connected", time: new Date().toISOString() });
});
app.get("/api/about", (req, res) =>
  res.json({ name: "АгроМаркет", version: "1.0", author: "Студент 2 курса" }),
);
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use((req, res) =>
  res
    .status(404)
    .json({ error: `Маршрут ${req.method} ${req.originalUrl} не найден` }),
);
app.use(errorHandler);
export default app;
