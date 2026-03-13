import { Router } from "express";
import { appController } from "../controllers/appController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticate, appController.applyToJob);
router.get("/my", authenticate, appController.getMyApplications);
router.get("/job/:jobId", authenticate, appController.getJobApplications);
router.put("/:id/status", authenticate, appController.updateApplicationStatus);

export default router;
