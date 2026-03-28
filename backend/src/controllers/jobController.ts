import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { JobModel } from "../models/Job.js";

export const jobController = {
  getAllJobs: async (req: AuthRequest, res: Response) => {
    try {
      const jobs = await JobModel.find({ status: 'open' })
        .populate('company_id', 'name')
        .sort({ created_at: -1 });

      const { CompanyModel } = await import("../models/Company.js");
      const companyUserIds = jobs.map(j => j.company_id._id || j.company_id);
      const companyProfiles = await CompanyModel.find({ user_id: { $in: companyUserIds } });
      
      const transformedJobs = jobs.map(job => {
        const profile = companyProfiles.find(p => p.user_id.toString() === (job.company_id._id || job.company_id).toString());
        return {
          ...job.toObject(),
          id: job._id.toString(),
          company_name: (job.company_id as any)?.name,
          custom_form: profile ? profile.custom_form : undefined
        };
      });
      
      res.json(transformedJobs);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch jobs", details: err.message });
    }
  },

  createJob: async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'company' && req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { title, description, requirements, salary, location, min_cgpa, vacancies } = req.body;
    
    try {
      const newJob = await JobModel.create({
        company_id: req.user.id,
        title,
        description,
        requirements,
        salary,
        location,
        min_cgpa: min_cgpa || 0,
        vacancies: vacancies || 1,
        status: 'open'
      });

      // Notify all students asynchronously
      const { UserModel } = await import("../models/User.js");
      const { sendEmail } = await import("../utils/sendEmail.js");
      UserModel.find({ role: 'student' }).select('email').then(students => {
         students.forEach(student => {
            if (student.email) {
               sendEmail(
                  student.email, 
                  `New Opportunity: ${title}`, 
                  `<p>Hi!</p><p>A new role for <b>${title}</b> has just been posted. Log in to your dashboard to view the requirements and apply!</p>`
               ).catch(console.error);
            }
         });
      }).catch(console.error);

      res.json({ message: "Job posted", job: newJob });
    } catch (err: any) {
      res.status(400).json({ error: "Failed to post job", details: err.message });
    }
  },

  getMyJobs: async (req: AuthRequest, res: Response) => {
    try {
      const jobs = await JobModel.find({ company_id: req.user?.id });
      res.json(jobs.map(job => ({ ...job.toObject(), id: job._id.toString() })));
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch your jobs", details: err.message });
    }
  },

  deleteJob: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
      const job = await JobModel.findById(id);
      if (!job) return res.status(404).json({ error: "Job not found" });
      
      // Check if user is the owner
      if (job.company_id.toString() !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ error: "Unauthorized to delete this job" });
      }

      await JobModel.findByIdAndDelete(id);
      res.json({ message: "Job deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to delete job", details: err.message });
    }
  },

  updateJob: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { title, description, requirements, salary, location, min_cgpa, vacancies, status } = req.body;
    
    try {
      const job = await JobModel.findById(id);
      if (!job) return res.status(404).json({ error: "Job not found" });

      // Check if user is the owner
      if (job.company_id.toString() !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ error: "Unauthorized to update this job" });
      }

      const updatedJob = await JobModel.findByIdAndUpdate(
        id,
        { title, description, requirements, salary, location, min_cgpa, vacancies, status },
        { new: true }
      );

      res.json({ message: "Job updated successfully", job: updatedJob });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update job", details: err.message });
    }
  }
};
