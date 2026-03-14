import { Response } from "express";
import { NotificationModel as Notification } from "../models/Notification";
import { AuthRequest } from "../middleware/auth";

export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.find({ user_id: req.user?.id })
      .sort({ created_at: -1 })
      .limit(20);
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { is_read: true });
    res.json({ message: "Notification marked as read" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
