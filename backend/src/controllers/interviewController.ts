import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { InterviewModel } from "../models/Interview.js";
import { ApplicationModel } from "../models/Application.js";
import { NotificationModel } from "../models/Notification.js";
import { StudentModel } from "../models/Student.js";
import { JobModel } from "../models/Job.js";

export const interviewController = {
  scheduleInterview: async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'company' && req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { application_id, scheduled_at } = req.body;
    const room_id = Math.random().toString(36).substring(2, 12);
    
    try {
      const interview = await InterviewModel.create({
        application_id,
        scheduled_at,
        room_id,
        status: 'scheduled'
      });

      // Update application status
      const app = await ApplicationModel.findByIdAndUpdate(application_id, { status: 'shortlisted' });
      
      if (app) {
        // Notify student
        await NotificationModel.create({
          user_id: app.student_id,
          message: `You have been shortlisted! Interview scheduled at: ${scheduled_at}`
        });
      }

      res.json({ message: "Interview scheduled", room_id, interview });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to schedule interview", details: err.message });
    }
  },

  getMyInterviews: async (req: AuthRequest, res: Response) => {
    try {
        let interviews;
        if (req.user?.role === 'student') {
            const apps = await ApplicationModel.find({ student_id: req.user.id });
            const appIds = apps.map(a => a._id);
            interviews = await InterviewModel.find({ application_id: { $in: appIds } })
                .populate({
                    path: 'application_id',
                    populate: { path: 'job_id', populate: { path: 'company_id', select: 'name' } }
                });
            
            const transformedInterviews = interviews.map(it => {
                const itObj = it.toObject();
                const app = itObj.application_id as any;
                return {
                    ...itObj,
                    title: app?.job_id?.title,
                    company_name: app?.job_id?.company_id?.name
                };
            });
            res.json(transformedInterviews);
        } else {
            // Company view
            const sideJobs = await JobModel.find({ company_id: req.user?.id });
            const sideJobIds = sideJobs.map(j => j._id);
            const sideApps = await ApplicationModel.find({ job_id: { $in: sideJobIds } });
            const sideAppIds = sideApps.map(a => a._id);
            
            interviews = await InterviewModel.find({ application_id: { $in: sideAppIds } })
                .populate({
                    path: 'application_id',
                    populate: [
                        { path: 'student_id', select: 'name' },
                        { path: 'job_id', select: 'title' }
                    ]
                });
            
            const transformedInterviews = interviews.map(it => {
                const itObj = it.toObject();
                const app = itObj.application_id as any;
                return {
                    ...itObj,
                    title: app?.job_id?.title,
                    student_name: app?.student_id?.name
                };
            });
            res.json(transformedInterviews);
        }
    } catch (err: any) {
        res.status(500).json({ error: "Failed to fetch interviews", details: err.message });
    }
  },

  getInterviewByRoom: async (req: AuthRequest, res: Response) => {
    const { roomId } = req.params;
    try {
      const interview = await InterviewModel.findOne({ room_id: roomId })
        .populate({
          path: 'application_id',
          populate: [
            { path: 'student_id', select: 'name avatar_url' },
            { path: 'job_id', select: 'title' }
          ]
        });

      if (!interview) return res.status(404).json({ error: "Interview not found" });

      const app = (interview.application_id as any);
      const studentProfile = await StudentModel.findOne({ user_id: app.student_id });

      const result = {
        ...interview.toObject(),
        student_name: app.student_id?.name,
        skills: studentProfile?.skills,
        projects: studentProfile?.projects,
        ai_score: app.ai_score,
        ai_feedback: app.ai_feedback
      };

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch interview details", details: err.message });
    }
  },

  evaluateInterview: async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'company' && req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { id } = req.params;
    const { notes, rating, status } = req.body;
    
    try {
      const interview = await InterviewModel.findByIdAndUpdate(
        id, 
        { recruiter_notes: notes, evaluation_rating: rating, status }, 
        { new: true }
      );
      
      if (!interview) return res.status(404).json({ error: "Interview not found" });

      if (status === 'completed') {
        await ApplicationModel.findByIdAndUpdate(interview.application_id, { status: 'interviewed' });
      }

      res.json({ message: "Evaluation saved", interview });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to save evaluation", details: err.message });
    }
  }
};
