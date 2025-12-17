import type { WebSocket } from "ws";

export interface JwtPayload {
  userId: string;
  username: string;
}

export type WSContext = WebSocket & {
  userId?: string;
  username?: string;
  roomId?: string;
  isAlive?: boolean;
};
