import Redis, { RedisOptions } from "ioredis";
import { config } from "./env";

const redisConfig: RedisOptions = {
  host: config.Redis_Host,
  port: config.Redis_Port,
  password: config.Redis_Password,
  db: config.Redis_db,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times) => Math.min(times * 50, 2000),
};

const redis = new Redis(redisConfig);

export default redis;
