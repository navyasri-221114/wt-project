import { Router } from "express";
import { adminController } from "../controllers/adminController.js";
import { getPlacementAnalytics } from "../controllers/analyticsController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/keys", authenticate, adminController.getKeys);
router.post("/keys", authenticate, adminController.generateKey);
router.put("/keys/:id/status", authenticate, adminController.updateKeyStatus);
router.get("/stats", authenticate, adminController.getStats);
router.get("/analytics", authenticate, adminController.getStudentAnalytics);
router.get("/placements/years", authenticate, getPlacementAnalytics);

export default router;
