import { redis } from ".";

export async function pushChatMessage(data: {
  roomId: string;
  userId: string;
  text: string;
  username: string;
}) {
  try {
    return await redis.xadd(
      "chat:messages",
      "*",
      "roomId",
      data.roomId,
      "userId",
      data.userId,
      "text",
      data.text,
      "username",
      data.username
    );
  } catch (error) {
    console.error("Redis XADD Error:", error);
    throw error;
  }
}
