# AuroraChat

AuroraChat is a horizontally scalable real-time chat system built with **WebSockets** and **Redis Pub/Sub**.

## Architecture

- Stateless WebSocket servers (multiple replicas)
- Redis Pub/Sub for message fan-out
- No sticky sessions

## Tech Stack

- Node.js + TypeScript
- WebSocket (`ws`)
- Redis
- Docker & Kubernetes

## Message Flow

1. Client sends message via WebSocket
2. Server validates and publishes to Redis
3. All WebSocket replicas receive it
4. Each replica fans out to local clients

## Scaling

Increase WebSocket replicas (e.g. 10 pods).  
Redis handles cross-pod fan-out automatically.
