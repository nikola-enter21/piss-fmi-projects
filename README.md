# AuroraChat - Real-Time Chat System

AuroraChat is a real-time chat application built with WebSockets, Kafka, Redis, and MongoDB.

---

## High-Level Architecture

The system follows a layered, event-driven architecture:

- Client Layer (Browser)
- Realtime Gateway (WebSocket Server)
- Messaging Backbone (Kafka)
- State and Caching Layer (Redis)
- Persistence Layer (MongoDB)

---

## Technology Stack

### Frontend

- HTML, CSS, JavaScript
- Browser WebSocket API
- JWT-based authentication
- Real-time UI updates

### Backend

- Node.js with TypeScript
- ws for WebSocket server
- jsonwebtoken for authentication
- KafkaJS for Kafka integration
- Redis for rate limiting
- MongoDB for persistence

### Infrastructure

- Docker
- Docker Compose
- Apache Kafka
- Zookeeper
- Redis
- MongoDB

---

## Core Components

### WebSocket Server

The WebSocket server acts as a realtime gateway and is responsible for:

- Authenticating users via JWT on connection
- Managing WebSocket lifecycle
- Protocol-level heartbeat using ping and pong
- Detecting and terminating stale connections
- Room membership management
- Online presence tracking
- Producing messages to Kafka

---

### Heartbeat and Connection Lifecycle

The system uses protocol-level heartbeat:

- Server sends WebSocket ping frames periodically
- Clients automatically respond with pong frames
- Missing pong results in connection termination

This reliably detects half-open connections and prevents zombie sockets.

---

### Presence and Online Users

Online presence is tracked inside the WebSocket server:

- Each room keeps an in-memory set of active sockets
- A map of userId to username is maintained per room
- Presence is updated on connect and disconnect
- Online user lists are broadcast to room participants

---

### Messaging Flow

1. Client sends message over WebSocket
2. Server validates rate limits
3. Message is produced to Kafka
4. Consumers read messages and broadcast to clients
5. Clients render messages in real time

Kafka decouples message ingestion from fan-out.

---

### Rate Limiting

- Implemented with Redis
- Applied per user per room
- Prevents message spam
- Client receives explicit rate-limited response

---

### Authentication

- Users authenticate via REST API
- JWT token is issued on login
- WebSocket requires valid JWT
- Identity is attached to WebSocket context

---

## Local Development

### Prerequisites

- Docker
- Docker Compose
- Node.js

### Running the Stack

```bash
./run.sh
```

## Future Improvements

### Scaling

Run multiple WebSocket servers and scale with K8s.

### Fan-Out and Hot Rooms/Partitions

Add a fan-out layer to avoid broadcasting messages directly from the WebSocket server.

### Dynamic Rooms and History

Allow dynamic room creation and persist messages so new users can load the last K messages when joining.
