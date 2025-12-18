import mongoose from "mongoose";

export const MessageSchema = new mongoose.Schema(
  {
    // roomId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Room",
    //   required: true,
    // },
    roomId: {
      type: String, // Don't have time right now, but we need to migrate to ObjectId later when we can create actual rooms
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: { type: String, required: true },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    attachments: [
      {
        url: { type: String, required: true },
        fileType: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

MessageSchema.index({ roomId: 1, createdAt: -1 });

export const Message = mongoose.model("Message", MessageSchema);
