import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";

import { env } from "./config/env";
import { User } from "./models/user.model";

async function main() {
  await mongoose.connect(env.MONGO_URL);
  console.log("Mongo connected (users-service)");

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.post("/api/auth/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ error: "User exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    await User.create({ username, passwordHash: hash });

    res.json({ ok: true });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.sendStatus(401);

    const ok = await bcrypt.compare(password, user.passwordHash as string);
    if (!ok) return res.sendStatus(401);

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  });

  app.listen(env.PORT, () => {
    console.log(`User service listening on ${env.PORT}`);
  });
}

main().catch((err) => {
  console.error("Fatal error (users-service):", err);
  process.exit(1);
});
