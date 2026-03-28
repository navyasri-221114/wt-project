import { Router } from "express";
import { externalJobController } from "../controllers/externalJobController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Public routes — no auth required for browsing external jobs
router.get("/external", externalJobController.getExternal);
router.get("/all", externalJobController.getAll);
// Admin debug route
router.get("/external/cache", authenticate, externalJobController.getCacheStatus);

export default router;
