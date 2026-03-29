import { Server } from "http";
import app from "./app";
import { config } from "./config/env";
import logger from "./config/logger";
import redis from "./config/redis";

let server: Server;
server = app.listen(config.Port, () => {
  logger.info(`server running on http://loocalhost:${config.Port}`);
});

let isShuttingDown = false;

redis.on("connect", () => logger.info("Redis Connected"));
redis.on("ready", () => logger.info("Redis Ready"));
redis.on("error", (err) => logger.error("Redis Error", err));
redis.on("close", () => logger.warn("Redis connection closed"));
redis.on("reconnecting", (delay: number) =>
  logger.info("Redis reconnecting", delay),
);

const shutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`${signal} received. Starting graceful shutdown...`);

  try {
    if (server) {
      server.close(async () => {
        logger.info("⛔ HTTP server closed.");
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  } catch (err) {
    logger.error("Error during shutdown:", err);
    process.exit(1);
  }
};

process.on("unhandledRejection", (err: Error) => {
  logger.error("💥 UNHANDLED REJECTION!");
  logger.error(err);
  shutdown("UNHANDLED_REJECTION");
});

process.on("uncaughtException", (err: Error) => {
  logger.error("💥 UNCAUGHT EXCEPTION!");
  logger.error(err);
  shutdown("UNCAUGHT_EXCEPTION");
});

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
