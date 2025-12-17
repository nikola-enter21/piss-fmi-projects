import http from "http";
import express from "express";
import cors from "cors";

import { createWsServer } from "./ws/server";
import { env } from "./config/env";
import { producer, startProducer } from "./kafka/producer";
import { consumer, startConsumer } from "./kafka/consumer";

let shuttingDown = false;

async function main() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const server = http.createServer(app);

  const wsCleanup = createWsServer(server);
  await startProducer();
  await startConsumer();

  server.listen(env.PORT, () => {
    console.log(`Chat service listening on ${env.PORT}`);
  });

  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log("Graceful shutdown (chat-service)");

    wsCleanup();
    server.close();

    try {
      await producer.disconnect();
      await consumer.disconnect();
    } catch (e) {
      console.error("Kafka shutdown error", e);
    }

    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("Fatal error (chat-service):", err);
  process.exit(1);
});
