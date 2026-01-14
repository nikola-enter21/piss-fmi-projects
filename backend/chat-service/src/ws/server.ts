import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { allowMessage } from "../redis/rate-limit";
import { redis } from "../redis";
import { WSContext } from "./ws.types";
import { isWSContext } from "./ws.guards";
import { joinRoom, leaveAllRooms } from "./rooms";
import { pushChatMessage } from "../redis/streams";

interface JwtPayload {
  userId: string;
  username: string;
}

export function createWsServer(server: any) {
  const wss = new WebSocketServer({ 
    server,
    handleProtocols: (protocols) => {
      // Accept any Bearer.* protocol for authentication
      const authProtocol = protocols.find((p) => p.startsWith("Bearer."));
      return authProtocol || false;
    }
  });

  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!isWSContext(ws)) return;
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30_000);

  wss.on("connection", async (ws: WSContext, req) => {
    ws.isAlive = true;
    ws.on("pong", () => (ws.isAlive = true));

    // Extract token from Sec-WebSocket-Protocol header
    const protocols = req.headers["sec-websocket-protocol"];
    const protocolHeader = Array.isArray(protocols) ? protocols.join(",") : protocols;
    const BEARER_PREFIX = "Bearer.";
    const token = protocolHeader?.split(",")
      .map(p => p.trim())
      .find(p => p.startsWith(BEARER_PREFIX))
      ?.slice(BEARER_PREFIX.length);
    
    if (!token) return ws.close();

    let user: JwtPayload;
    try {
      user = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch {
      return ws.close();
    }

    ws.userId = user.userId;
    ws.username = user.username;
    ws.roomId = "general";
    joinRoom(ws.roomId, ws);

    ws.on("message", async (raw) => {
      const msg = JSON.parse(raw.toString());
      if (!msg.text) return;

      const allowed = await allowMessage(ws.userId!, ws.roomId!);
      if (!allowed) {
        ws.send(JSON.stringify({ type: "rate_limited" }));
        return;
      }
      if (!ws.roomId || !ws.userId || !ws.username) {
        return;
      }

      await Promise.all([
        redis.publish(
          `chat.${ws.roomId}`,
          JSON.stringify({
            user: ws.username,
            text: msg.text,
            ts: Date.now(),
          })
        ),
        pushChatMessage({
          roomId: ws.roomId,
          text: msg.text,
          userId: ws.userId,
          username: ws.username,
        }),
      ]);
    });

    ws.on("close", async () => {
      leaveAllRooms(ws);
    });
  });

  return () => {
    clearInterval(heartbeatInterval);
    wss.clients.forEach((ws) => ws.terminate());
    wss.close();
  };
}
