import { Router } from "express";
import { jobController } from "../controllers/jobController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", jobController.getAllJobs);
router.post("/", authenticate, jobController.createJob);
router.get("/my", authenticate, jobController.getMyJobs);

export default router;
