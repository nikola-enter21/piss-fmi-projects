export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  MONGO_URL: process.env.MONGO_URL ?? "mongodb://localhost:27017/aurorachat",
  JWT_SECRET: process.env.JWT_SECRET ?? "dev-secret",
  REDIS_HOST: process.env.REDIS_HOST ?? "localhost",
  REDIS_PORT: Number(process.env.REDIS_PORT ?? 6379),
};
