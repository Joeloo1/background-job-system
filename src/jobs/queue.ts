import { Queue } from "bullmq";
import redis from "../config/redis";

const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential" as const,
    delay: 5000,
  },
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 50 },
};

export const EmailQueue = new Queue("email", {
  connection: redis,
  defaultJobOptions,
});
