# AuroraChat

AuroraChat is a horizontally scalable real-time chat system built with **WebSockets**, **Redis**, and **MongoDB**.

## Architecture

- **Stateless WebSocket servers**: Multiple replicas handling real-time traffic.
- **Redis Pub/Sub**: Message fan-out across all active server replicas.
- **Redis Streams**: High-throughput message queue for asynchronous persistence.
- **Ingestion Service**: Independent background workers that persist messages to the database.
- **MongoDB**: Permanent storage with optimized indexing for chat history.
- **No sticky sessions**: Clients can connect to any available replica.

## Tech Stack

- Node.js + TypeScript
- WebSocket (`ws`)
- Redis (Pub/Sub & Streams)
- MongoDB + Mongoose
- Docker & Kubernetes

## Message Flow

1. **Ingress**: Client sends a message via WebSocket.
2. **Parallel Processing**:
   - **Real-time Path**: Server publishes the message to Redis Pub/Sub for immediate delivery.
   - **Persistence Path**: Server appends the message to a Redis Stream (`chat:messages`).
3. **Fan-out**: All WebSocket replicas receive the Pub/Sub message and deliver it to their local clients.
4. **Ingestion**: Ingestion Service reads batches from the Redis Stream using Consumer Groups.
5. **Storage**: Background workers perform bulk inserts into MongoDB to optimize database I/O.

## Reliability

- **Guaranteed Persistence**: Use of Redis Consumer Groups and XACK ensures messages are not lost if a worker fails.
- **Non-blocking I/O**: WebSocket servers remain responsive as they are decoupled from database write latency.
- **Backpressure**: Redis Streams act as a buffer during peak traffic or database maintenance.

## Scaling

- **WebSocket Layer**: Scale replicas (e.g. 10 pods) to increase concurrent connection capacity.
- **Ingestion Layer**: Scale worker replicas to handle higher message throughput.
- **Database Layer**: MongoDB handles long-term storage with compound indexing on roomId and createdAt.
