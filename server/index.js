import express from "express";
import cors from "cors";
import { initDatabase } from "./db/database.js";
import eventRoutes from "./routes/events.js";
import bookingRoutes from "./routes/bookings.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

/* ------------  CORS  ----------------- */
const allowedOrigin = process.env.FRONTEND_URL || "*";
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
/* ------------------------------------- */

app.use(express.json());

initDatabase();

app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/api/health", (_, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);

/* ---- Render injects PORT, local falls back to 3001 ---- */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 BookMySlot server running on ${PORT}`);
});