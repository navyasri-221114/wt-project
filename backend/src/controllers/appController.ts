import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { ApplicationModel } from "../models/Application.js";
import { JobModel } from "../models/Job.js";
import { StudentModel } from "../models/Student.js";
import { NotificationModel } from "../models/Notification.js";
import { GoogleGenAI } from "@google/genai";

export const appController = {
  applyToJob: async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'student') return res.status(403).json({ error: "Forbidden" });
    const { job_id } = req.body;
    
    try {
      // Check eligibility
      const job = await JobModel.findById(job_id);
      const studentProfile = await StudentModel.findOne({ user_id: req.user.id });
      
      if (!job || !studentProfile) {
        return res.status(404).json({ error: "Job or Student Profile not found" });
      }

      if ((studentProfile.cgpa || 0) < (job.min_cgpa || 0)) {
        return res.status(400).json({ error: "You do not meet the minimum CGPA requirement for this job." });
      }

      // AI Scoring
      let ai_score = 70;
      let ai_feedback = "Good match based on skills.";

      if (process.env.GEMINI_API_KEY) {
        try {
          const genAI = new (GoogleGenAI as any)({ apiKey: process.env.GEMINI_API_KEY });
          const result = await genAI.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [{ parts: [{ text: prompt }] }]
          });
          
          const text = result.text;
          const cleanJson = text.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(cleanJson);
          ai_score = parsed.score;
          ai_feedback = parsed.feedback;
        } catch (e) {
          console.error("AI Scoring failed", e);
        }
      }

      const application = await ApplicationModel.create({
        job_id,
        student_id: req.user.id,
        ai_score,
        ai_feedback
      });

      res.json({ message: "Application submitted", application });
    } catch (err: any) {
      if (err.code === 11000) {
        return res.status(400).json({ error: "Already applied" });
      }
      res.status(500).json({ error: "Application failed", details: err.message });
    }
  },

  getMyApplications: async (req: AuthRequest, res: Response) => {
    try {
      const apps = await ApplicationModel.find({ student_id: req.user?.id })
        .populate({
            path: 'job_id',
            populate: { path: 'company_id', select: 'name' }
        });
      
      const transformedApps = apps.map(app => {
        const appObj = app.toObject();
        const job = appObj.job_id as any;
        return {
          ...appObj,
          title: job?.title,
          company_name: job?.company_id?.name
        };
      });

      res.json(transformedApps);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch applications", details: err.message });
    }
  },

  getJobApplications: async (req: AuthRequest, res: Response) => {
    const { jobId } = req.params;
    try {
      const apps = await ApplicationModel.find({ job_id: jobId })
        .populate('student_id', 'name')
        .sort({ ai_score: -1 });

      // We also need student profile details (cgpa, skills)
      const appsWithProfiles = await Promise.all(apps.map(async (app) => {
        const profile = await StudentModel.findOne({ user_id: app.student_id });
        const appObj = app.toObject();
        return {
          ...appObj,
          student_name: (app.student_id as any)?.name,
          cgpa: profile?.cgpa,
          skills: profile?.skills
        };
      }));

      res.json(appsWithProfiles);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch job applications", details: err.message });
    }
  },

  updateApplicationStatus: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const app = await ApplicationModel.findByIdAndUpdate(id, { status }, { new: true });
      if (!app) return res.status(404).json({ error: "Application not found" });

      // Notify student
      await NotificationModel.create({
        user_id: app.student_id,
        message: `Your application status has been updated to: ${status}`
      });

      res.json({ message: "Status updated", application: app });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update status", details: err.message });
    }
  }
};
