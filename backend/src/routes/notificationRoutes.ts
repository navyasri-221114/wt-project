import express from "express";
import { getMyNotifications, markAsRead } from "../controllers/notificationController";
import { authenticate as auth } from "../middleware/auth";

const router = express.Router();

router.get("/my", auth, getMyNotifications);
router.put("/:id/read", auth, markAsRead);

export default router;
