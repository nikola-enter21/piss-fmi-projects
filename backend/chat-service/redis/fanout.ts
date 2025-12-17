import { rooms } from "../ws/rooms";
import { redisSub } from ".";

export async function startChatFanout() {
  await redisSub.psubscribe("chat.*");

  redisSub.removeAllListeners("pmessage"); // hacky fix to handle hot reload
  redisSub.on("pmessage", (_pattern, channel, message) => {
    const [, roomId] = channel.split(".", 2);
    if (!roomId) return;
    const sockets = rooms.get(roomId);
    if (!sockets) return;

    for (const ws of sockets) {
      if (ws.readyState === ws.OPEN) {
        ws.send(message);
      }
    }
  });

  return async () => {
    await redisSub.punsubscribe("chat.*");
    await redisSub.quit();
  };
}
