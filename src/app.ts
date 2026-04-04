import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { config } from "./config/env";
import jobsRouter from "./routes/jobs.routes";
import { serverAdapter } from "./config/bull-board";

const app: Express = express();

// Development logging
if (config.Node_env === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Request Limiting from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "To many request from this IP,Please try again later ",
});

app.use("/api", limiter);
app.use("/api/jobs", jobsRouter);
app.use("/admin/queues", serverAdapter.getRouter());

export default app;
