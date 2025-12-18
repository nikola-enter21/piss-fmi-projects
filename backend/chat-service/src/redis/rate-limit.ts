import { redis } from ".";

const WINDOW_MS = 1000;
const MAX_MESSAGES = 3;

export async function allowMessage(
  userId: string,
  roomId: string
): Promise<boolean> {
  const key = `rate:${userId}:${roomId}`;

  const count = await redis.incr(key);

  if (count === 1) {
    await redis.pexpire(key, WINDOW_MS);
  }

  return count <= MAX_MESSAGES;
}
