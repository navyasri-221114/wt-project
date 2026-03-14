import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { JobModel } from "../models/Job.js";

export const jobController = {
  getAllJobs: async (req: AuthRequest, res: Response) => {
    try {
      const jobs = await JobModel.find({ status: 'open' })
        .populate('company_id', 'name')
        .sort({ created_at: -1 });
      
      // Transform to match previous structure if necessary (company_name field)
      const transformedJobs = jobs.map(job => ({
        ...job.toObject(),
        id: job._id.toString(),
        company_name: (job.company_id as any)?.name
      }));
      
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
  }
};
