import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { config } from "./env";
import logger from "./logger";

const pool = new Pool({
  connectionString: config.DB,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
  errorFormat: "pretty",
  adapter,
});

export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("Database connection failed", error);
    process.exit(1);
  }
};

export const disconnectDatabase = async () => {
  await prisma.$disconnect();
  logger.info("Database disconnected successfully");
};
