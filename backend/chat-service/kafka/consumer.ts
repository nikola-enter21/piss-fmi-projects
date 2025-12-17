import { Kafka } from "kafkajs";
import { rooms } from "../ws/rooms";

const kafka = new Kafka({
  brokers: ["localhost:9092"],
});

export const consumer = kafka.consumer({
  groupId: "ws-chat-consumers",
});

export async function startConsumer() {
  await consumer.connect();

  await consumer.subscribe({
    topic: "chat.general",
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      const payload = JSON.parse(message.value.toString());
      const sockets = rooms.get("general");
      if (!sockets) return;

      for (const ws of sockets) {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify(payload));
        }
      }
    },
  });

  console.log("Kafka consumer running");
}
