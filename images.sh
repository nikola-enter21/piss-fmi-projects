docker build --no-cache -f backend/chat-service/Dockerfile -t chat-service:latest .
docker build --no-cache -f backend/user-service/Dockerfile -t user-service:latest .