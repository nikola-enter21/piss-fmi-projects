import mongoose from "mongoose";
import { env } from "../config/env";

export async function connectMongoDB() {
  try {
    if (mongoose.connection.readyState >= 1) return;

    await mongoose.connect(env.MONGO_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
