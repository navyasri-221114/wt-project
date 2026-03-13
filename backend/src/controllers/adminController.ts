import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { ActivationKeyModel } from "../models/ActivationKey.js";
import { UserModel } from "../models/User.js";
import { JobModel } from "../models/Job.js";
import { ApplicationModel } from "../models/Application.js";
import { InterviewModel } from "../models/Interview.js";

export const adminController = {
  getKeys: async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    try {
      const keys = await ActivationKeyModel.find().sort({ created_at: -1 });
      const result = keys.map(k => ({ ...k.toObject(), id: k._id.toString() }));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch keys", details: err.message });
    }
  },

  generateKey: async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    const key = `COMP-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    try {
      const newKey = await ActivationKeyModel.create({ key });
      res.json(newKey);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to generate key", details: err.message });
    }
  },

  updateKeyStatus: async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    const { id } = req.params;
    const { status } = req.body;
    try {
      const key = await ActivationKeyModel.findByIdAndUpdate(id, { status }, { new: true });
      res.json({ message: "Key status updated", key });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update key status", details: err.message });
    }
  },

  getStats: async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    try {
      const totalStudents = await UserModel.countDocuments({ role: 'student' });
      const totalCompanies = await UserModel.countDocuments({ role: 'company' });
      const totalJobs = await JobModel.countDocuments();
      const totalApplications = await ApplicationModel.countDocuments();
      const totalInterviews = await InterviewModel.countDocuments();
      
      const selectedCount = await ApplicationModel.countDocuments({ status: 'selected' });
      const placementRate = totalStudents > 0 ? (selectedCount / totalStudents) * 100 : 0;

      res.json({ 
        totalStudents, 
        totalCompanies, 
        totalJobs, 
        totalApplications, 
        totalInterviews, 
        placementRate 
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch stats", details: err.message });
    }
  }
};
