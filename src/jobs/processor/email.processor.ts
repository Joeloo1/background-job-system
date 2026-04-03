import { Job } from "bullmq";
import { EmailQueue } from "../queue";
import { prisma } from "../../config/prisma";
import { sendEmail } from "../../utils/email";
import logger from "../../config/logger";

export const processEmailJob = async (job: Job): Promise<void> => {
  const { email, subject, html } = job.data;

  logger.info(`Processing email job ${job.id} for ${email}`);
  try {
    await sendEmail({ email, subject, html });
    logger.info(`Email sent to ${email}`);

    // Update job record in database
    await prisma.job.update({
      where: { id: job.data.dbJobId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        result: { message: `Email sent to ${email}` },
      },
    });
  } catch (error: any) {
    logger.error(`Failed to send email to ${email}: ${error.message}`);
    throw error;
  }
};
