import { Router } from "express";
// import { getVerificationEmailHtml } from "../utils/email";
import { EnqueueJob, getJobStatus } from "../controller/job.controller";

const router: Router = Router();

router.post("/email", EnqueueJob);
router.get("/:id", getJobStatus);

// // Test verification email template
// router.post("/test-verification", async (req: Request, res: Response) => {
//   const { email, firstName, verifyUrl } = req.body;
//
//   if (!email || !firstName || !verifyUrl) {
//     return res.status(400).json({ error: "Missing email, firstName, or verifyUrl" });
//   }
//
//   try {
//     const html = getVerificationEmailHtml(verifyUrl, firstName);
//
//     const dbJob = await prisma.job.create({
//       data: {
//         name: "test-verification",
//         queue: "email",
//         status: "PENDING",
//         payload: { email, subject: "Verify Your Email", html },
//       },
//     });
//
//     await EmailQueue.add("send-test-verification", {
//       email,
//       subject: "Verify Your Email",
//       html,
//       dbJobId: dbJob.id,
//     });
//
//     res.status(202).json({
//       message: "Test verification email enqueued",
//       jobId: dbJob.id,
//     });
//   } catch (error: any) {
//     logger.error("Failed to enqueue test verification email", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });
export default router;
