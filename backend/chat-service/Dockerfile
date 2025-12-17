FROM node:20-alpine AS builder

WORKDIR /app

COPY backend/package*.json ./
COPY backend/tsconfig.json ./

RUN npm ci

COPY backend/chat-service ./chat-service

RUN npx tsc chat-service/index.ts \
    --outDir dist/chat-service \
    --module commonjs \
    --target es2020 \
    --esModuleInterop

FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY backend/package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist/chat-service ./dist

CMD ["node", "dist/index.js"]