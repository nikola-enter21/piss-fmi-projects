import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { allowMessage } from "../rate-limit";
import { joinRoom, leaveAllRooms, broadcastOnline } from "./rooms";
import { redisPub } from "../redis";
import { setOnline, setOffline } from "./presence";
import { WSContext } from "./ws.types";
import { isWSContext } from "./ws.guards";

interface JwtPayload {
  userId: string;
  username: string;
}

export function createWsServer(server: any) {
  const wss = new WebSocketServer({ server });

  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!isWSContext(ws)) return;

      if (ws.isAlive === false) {
        ws.terminate();
        return;
      }

      ws.isAlive = false;
      ws.ping();
    });
  }, 30_000);

  wss.on("connection", async (ws: WSContext, req) => {
    ws.isAlive = true;
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    const token = new URL(req.url ?? "", "http://x").searchParams.get("token");
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
    await setOnline(ws.roomId, ws.userId, ws.username);
    await broadcastOnline(ws.roomId);

    ws.on("message", async (raw) => {
      let msg: any;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }

      if (!msg.text) return;

      const allowed = await allowMessage(ws.userId!, ws.roomId!);
      if (!allowed) {
        ws.send(JSON.stringify({ type: "rate_limited" }));
        return;
      }
      if (!ws.roomId || !ws.userId || !ws.username) {
        ws.close();
        return;
      }

      await redisPub.publish(
        `chat.${ws.roomId}`,
        JSON.stringify({
          user: ws.username,
          text: msg.text,
          ts: Date.now(),
        })
      );
    });

    ws.on("close", async () => {
      leaveAllRooms(ws);
      await setOffline(ws.roomId!, ws.userId!);
      await broadcastOnline(ws.roomId!);
    });
  });

  // cleanup function
  return () => {
    clearInterval(heartbeatInterval);
    wss.clients.forEach((ws) => ws.terminate());
    wss.close();
  };
}
