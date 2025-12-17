import { WebSocket } from "ws";

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
