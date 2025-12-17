export const env = {
  PORT: Number(process.env.PORT ?? 8080),
  JWT_SECRET: process.env.JWT_SECRET ?? "dev-secret",
  REDIS_HOST: process.env.REDIS_HOST ?? "localhost",
  REDIS_PORT: Number(process.env.REDIS_PORT ?? 6379),
};
