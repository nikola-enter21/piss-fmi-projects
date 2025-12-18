import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Името на стаята е задължително"],
      trim: true,
      minlength: [3, "Името трябва да е поне 3 символа"],
      maxlength: [50, "Името не може да превишава 50 символа"],
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

RoomSchema.index({ name: 1 });
