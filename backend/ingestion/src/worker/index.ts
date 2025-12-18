import { Message } from "../models/message.model";
import { redis } from "../redis";

interface ChatMessageEntry {
  roomId: string;
  userId: string;
  text: string;
  username: string;
}

type RedisStreamRawResponse = [string, [string, string[]][]][];

const STREAM_KEY = "chat:messages";
const GROUP_NAME = "mongo_workers";
const CONSUMER_NAME = `worker_${process.pid}`;

export async function runIngestionJob() {
  try {
    await redis.xgroup("CREATE", STREAM_KEY, GROUP_NAME, "0", "MKSTREAM");
  } catch (e: any) {
    if (!e.message.includes("BUSYGROUP")) throw e;
  }

  while (true) {
    try {
      const data = (await redis.xreadgroup(
        "GROUP",
        GROUP_NAME,
        CONSUMER_NAME,
        "COUNT",
        "50",
        "BLOCK",
        "5000",
        "STREAMS",
        STREAM_KEY,
        ">"
      )) as unknown as RedisStreamRawResponse;

      if (!data || data.length === 0) continue;

      const messages = data[0]?.[1];
      if (!messages) continue;

      const batch = [];
      const idsForAck = [];

      for (const [streamId, fields] of messages) {
        const msgObj: Partial<ChatMessageEntry> = {};
        for (let i = 0; i < fields.length; i += 2) {
          const key = fields[i] as keyof ChatMessageEntry;
          const value = fields[i + 1];
          if (key && value) {
            msgObj[key] = value;
          }
        }

        batch.push({
          roomId: msgObj.roomId,
          userId: msgObj.userId,
          text: msgObj.text,
          status: "sent",
        });

        idsForAck.push(streamId);
      }

      if (batch.length > 0) {
        await Message.insertMany(batch);
        await redis.xack(STREAM_KEY, GROUP_NAME, ...idsForAck);
      }
    } catch (err) {
      console.error(err);
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
}
