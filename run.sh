#!/usr/bin/env bash

set -e

echo "Starting docker services..."
docker-compose up -d

echo "Waiting for docker services to initialize..."
sleep 5

echo "Starting backend services..."
cd backend
npm install
npm run dev &
BACKEND_PID=$!
cd ..

echo "Starting frontend..."
cd frontend

if ! command -v serve >/dev/null 2>&1; then
  npm install -g serve
fi

serve -l 3000 . &
FRONTEND_PID=$!
cd ..

echo "Chat WS: ws://localhost:8080"
echo "Press Ctrl+C to stop all services"

trap 'echo "Stopping services..."; \
  kill -TERM $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; \
  docker-compose down' SIGINT SIGTERM

wait