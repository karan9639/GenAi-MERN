import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import interviewRoutes from "./routes/interview.routes.js";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(express.static("public"));

app.get("/api/v1/health", (_, res) => {
  res.status(200).json({ success: true, message: "API is healthy" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/interviews", interviewRoutes);

app.use((_, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

export { app };
