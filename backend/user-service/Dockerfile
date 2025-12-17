FROM node:20-alpine AS builder

WORKDIR /app

COPY backend/package*.json ./
COPY backend/tsconfig.json ./

RUN npm ci

COPY backend/user-service ./user-service

RUN npx tsc user-service/index.ts \
    --outDir dist/user-service \
    --module commonjs \
    --target es2020 \
    --esModuleInterop


FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY backend/package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist/user-service ./dist

CMD ["node", "dist/index.js"]