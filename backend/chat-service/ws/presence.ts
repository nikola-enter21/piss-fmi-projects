import { redis } from "../redis";

export async function setOnline(
  roomId: string,
  userId: string,
  username: string
) {
  await redis.hset(`room:${roomId}:online`, userId, username);
}

export async function setOffline(roomId: string, userId: string) {
  await redis.hdel(`room:${roomId}:online`, userId);
}

export async function getOnlineUsers(roomId: string): Promise<string[]> {
  const users = await redis.hgetall(`room:${roomId}:online`);
  return Object.values(users);
}
