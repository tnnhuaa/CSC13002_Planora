import express from "express";
import { connectDB } from "./config/db.js";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import { protectedRoute } from "./middleware/authMiddleware.js";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// public routes
app.use("/api/auth", authRoute);

// private routes
app.use(protectedRoute);
app.use("/api/users", userRoute);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server start with port ${PORT}`);
  });
});
