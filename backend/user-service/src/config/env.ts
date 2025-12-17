export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  MONGO_URL: process.env.MONGO_URL ?? "mongodb://mongo:27017/users",
  JWT_SECRET: process.env.JWT_SECRET ?? "dev-secret",
};
