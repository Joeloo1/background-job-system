import { Request, Response } from "express";
import { EmailQueue } from "../jobs/queue";
import { prisma } from "../config/prisma";
import logger from "../config/logger";

// Enqueue email job
export const EnqueueJob = async (req: Request, res: Response) => {
  const { email, subject, html } = req.body;

  if (!email || !subject || !html) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1. Create job in database
    const dbJob = await prisma.job.create({
      data: {
        name: "email",
        queue: "email",
        status: "PENDING",
        payload: { email, subject, html },
      },
    });

    // 2. Add to BullMQ
    await EmailQueue.add("send-email", {
      email,
      subject,
      html,
      dbJobId: dbJob.id,
    });

    logger.info(`Enqueued email job for ${email}, DB ID: ${dbJob.id}`);

    res.status(202).json({
      message: "Email job enqueued",
      jobId: dbJob.id,
    });
  } catch (error: any) {
    logger.error("Failed to enqueue email job", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get job status
export const getJobStatus = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const job = await prisma.job.findUnique({
      where: { id: id as string },
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(job);
  } catch (error: any) {
    logger.error(`Failed to fetch job status for ${id}`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};
