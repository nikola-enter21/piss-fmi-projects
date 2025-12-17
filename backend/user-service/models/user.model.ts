import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  username: { type: String, unique: true },
  passwordHash: String,
});

export const User = model("User", UserSchema);
