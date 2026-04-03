import { Worker, Job } from "bullmq";
import redis from "../config/redis";
import { processEmailJob } from "./processor/email.processor";
import logger from "../config/logger";
import { prisma, connectDatabase, disconnectDatabase } from "../config/prisma";

const QUEUES = ["email"];
type QueueName = (typeof QUEUES)[number];

const processors: Record<QueueName, (job: Job) => Promise<void>> = {
  email: processEmailJob,
};

const createWorker = (queueName: QueueName) => {
  const worker = new Worker(
    queueName,
    async (job) => {
      logger.info(
        `[Worker: ${queueName}] Processing job ${job.id}, ${job.name}`,
      );
      await prisma.job.update({
        where: { id: job.data.dbJobId },
        data: {
          status: "ACTIVE",
          startedAt: new Date(),
          attempts: { increment: 1 },
        },
      });

      const processor = processors[queueName];
      await processor(job);
    },
    {
      connection: redis,
      concurrency: 5,
    },
  );

  worker.on("completed", (job) => {
    logger.info(`[Worker: ${queueName}] Job ${job.id} completed successfully`);
  });

  worker.on("failed", async (job, error) => {
    logger.error(`[Worker: ${queueName}] Job failed`, {
      jobId: job?.id,
      error: error.message,
      attempts: job?.attemptsMade,
    });

    if (job) {
      await prisma.job.update({
        where: { id: job.data.dbJobId },
        data: {
          status:
            job.attemptsMade >= (job.opts.attempts ?? 3) ? "FAILED" : "PENDING",
          error: error.message,
          failedAt: new Date(),
        },
      });
    }
  });

  worker.on("stalled", (jobId) => {
    logger.warn(`[Worker: ${queueName}] Job ${jobId} stalled`);
  });

  return worker;
};

const startWorkers = async () => {
  await connectDatabase();
  logger.info("Starting backgroung job workers...");

  const workers = QUEUES.map(createWorker);

  logger.info(`Workers for queues [${QUEUES.join(", ")}] started successfully`);

  const shutdown = async (reason: string) => {
    logger.info(`Shutting down workers due to ${reason}...`);
    await Promise.all(workers.map((w) => w.close()));
    await disconnectDatabase();
    logger.info("Workers shut down gracefully");
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

startWorkers().catch((error) => {
  logger.error("Failed to start workers", error);
  process.exit(1);
});
