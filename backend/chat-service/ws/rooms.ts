import { WebSocket } from "ws";
import { getOnlineUsers } from "./presence";

export const rooms = new Map<string, Set<WebSocket>>();

export function joinRoom(roomId: string, ws: WebSocket) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  rooms.get(roomId)!.add(ws);
}

export function leaveAllRooms(ws: WebSocket) {
  for (const sockets of rooms.values()) {
    sockets.delete(ws);
  }
}

export async function broadcastOnline(roomId: string) {
  const sockets = rooms.get(roomId);
  if (!sockets) return;

  const users = await getOnlineUsers(roomId);

  const payload = JSON.stringify({
    type: "online_users",
    users,
  });

  for (const ws of sockets) {
    ws.send(payload);
  }
}
