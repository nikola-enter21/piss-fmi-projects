import http from "http";
import express from "express";
import cors from "cors";

import { createWsServer } from "./src/ws/server";
import { env } from "./src/config/env";
import { startChatFanout } from "./src/redis/fanout";

let shuttingDown = false;

async function main() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const server = http.createServer(app);
  const wsCleanup = createWsServer(server);
  const messagesCleanup = await startChatFanout();

  server.listen(env.PORT, () => {
    console.log(`Chat service listening on ${env.PORT}`);
  });

  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;

    try {
      await messagesCleanup();
    } catch (e) {
      console.error("Redis shutdown error", e);
    }

    wsCleanup();
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("Fatal error (chat-service):", err);
  process.exit(1);
});
