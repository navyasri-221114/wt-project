import { Router } from "express";
import { interviewController } from "../controllers/interviewController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticate, interviewController.scheduleInterview);
router.get("/my", authenticate, interviewController.getMyInterviews);
router.get("/:roomId", authenticate, interviewController.getInterviewByRoom);
router.put("/:id/evaluate", authenticate, interviewController.evaluateInterview);

export default router;
