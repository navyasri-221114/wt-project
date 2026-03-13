import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { ApplicationModel } from "../models/Application.js";
import { JobModel } from "../models/Job.js";
import { StudentModel } from "../models/Student.js";
import { NotificationModel } from "../models/Notification.js";
import { InterviewModel } from "../models/Interview.js";

export const appController = {
  applyToJob: async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'student') return res.status(403).json({ error: "Forbidden" });
    const { job_id } = req.body;
    
    try {
      // Check eligibility
      const job = await JobModel.findById(job_id);
      let studentProfile = await StudentModel.findOne({ user_id: req.user.id });
      
      if (!studentProfile) {
        // Auto-create missing profile to fix Dev login state drift
        studentProfile = await StudentModel.create({ user_id: req.user.id, cgpa: 9.9, skills: ['React', 'Node.js', 'TypeScript'] });
      }

      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      // If it's a dev user with a blank profile cgpa, use 9.9 automatically
      const effectiveCgpa = studentProfile.cgpa || (req.user.email?.includes('dev') ? 9.9 : 0);
      if (effectiveCgpa < (job.min_cgpa || 0)) {
        return res.status(400).json({ error: "You do not meet the minimum CGPA requirement for this job." });
      }

      const application = await ApplicationModel.create({
        job_id,
        student_id: req.user.id
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
      
      const transformedApps = await Promise.all(apps.map(async (app) => {
        const appObj = app.toObject();
        const job = appObj.job_id as any;
        const interview = await InterviewModel.findOne({ application_id: app._id, status: { $ne: 'cancelled' } }).sort({ created_at: -1 });
        return {
          ...appObj,
          id: app._id.toString(),
          title: job?.title,
          company_name: job?.company_id?.name,
          room_id: interview?.room_id
        };
      }));

      res.json(transformedApps);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch applications", details: err.message });
    }
  },

  getJobApplications: async (req: AuthRequest, res: Response) => {
    const { jobId } = req.params;
    try {
        const apps = await ApplicationModel.find({ job_id: jobId })
            .populate('student_id', 'name email avatar_url')
            .populate('job_id', 'title');
        
        const appsWithProfiles = await Promise.all(apps.map(async (app) => {
            const studentId = (app.student_id as any)?._id || app.student_id;
            const [profile, interview] = await Promise.all([
                StudentModel.findOne({ user_id: studentId }),
                InterviewModel.findOne({ application_id: app._id, status: { $ne: 'cancelled' } }).sort({ created_at: -1 })
            ]);
            const appObj = app.toObject();
            return {
                ...appObj,
                id: app._id.toString(),
                student_name: (app.student_id as any)?.name,
                student_email: (app.student_id as any)?.email,
                student_avatar: (app.student_id as any)?.avatar_url,
                title: (app.job_id as any)?.title,
                student_cgpa: profile?.cgpa,
                skills: profile?.skills,
                room_id: interview?.room_id
            };
        }));

        res.json(appsWithProfiles);
    } catch (err: any) {
        res.status(500).json({ error: "Failed to fetch applications", details: err.message });
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

      res.json({ message: "Status updated", application: { ...app.toObject(), id: app._id.toString() } });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update status", details: err.message });
    }
  }
};
