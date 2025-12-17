import mongoose from 'mongoose';
export const RoomSchema = new mongoose.Schema({
  name: String,
  createdAt: { type: Date, default: Date.now }
});
export const Room = mongoose.model("Room", RoomSchema);