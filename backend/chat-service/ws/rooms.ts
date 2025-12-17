import { WebSocket } from "ws";

export const rooms = new Map<string, Set<WebSocket>>();
const onlineUsers = new Map<string, Map<string, { username: string }>>();

export function joinRoom(roomId: string, ws: WebSocket) {
  if (!rooms.has(roomId)) rooms.set(roomId, new Set());
  rooms.get(roomId)!.add(ws);
}

export function leaveAllRooms(ws: WebSocket) {
  for (const sockets of rooms.values()) {
    sockets.delete(ws);
  }
}

export function markOnline(roomId: string, userId: string, username: string) {
  if (!onlineUsers.has(roomId)) {
    onlineUsers.set(roomId, new Map());
  }
  onlineUsers.get(roomId)!.set(userId, { username });
}

export function markOffline(roomId: string, userId: string) {
  onlineUsers.get(roomId)?.delete(userId);
}

export async function broadcastOnline(roomId: string) {
  const sockets = rooms.get(roomId);
  if (!sockets) return;

  const users = Array.from(onlineUsers.get(roomId)?.values() ?? []).map(
    (u) => u.username
  );

  const payload = JSON.stringify({
    type: "online_users",
    users,
  });

  for (const ws of sockets) {
    ws.send(payload);
  }
}
