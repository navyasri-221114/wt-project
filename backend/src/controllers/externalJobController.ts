import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { externalJobService } from "../services/externalJobService.js";
import { JobModel } from "../models/Job.js";

export const externalJobController = {
  /**
   * GET /api/jobs/external
   * Returns external jobs with optional filters: ?company=Google&location=Bengaluru
   */
  getExternal: async (req: AuthRequest, res: Response) => {
    try {
      const { company, location, limit } = req.query;

      const jobs = await externalJobService.getJobs({
        company: company as string,
        location: location as string,
      });

      const maxResults = Math.min(parseInt(limit as string) || 20, 50);
      
      res.json({
        success: true,
        count: jobs.length,
        source: "external",
        cache: externalJobService.getCacheStatus(),
        jobs: jobs.slice(0, maxResults),
      });
    } catch (err: any) {
      console.error("[ExternalJobController] Unexpected error:", err.message);
      // Never 500 — always return something useful
      res.json({
        success: true,
        count: 0,
        source: "external",
        jobs: [],
        warning: "External job data temporarily unavailable.",
      });
    }
  },

  /**
   * GET /api/jobs/all
   * Merges internal (MongoDB) + external (API) jobs in a unified response.
   * Internal jobs take priority in ordering.
   */
  getAll: async (req: AuthRequest, res: Response) => {
    try {
      const { company, location, limit } = req.query;

      // Fetch internal + external in parallel for speed
      const [internalRaw, externalJobs] = await Promise.all([
        JobModel.find({ status: 'open' })
          .populate('company_id', 'name')
          .sort({ created_at: -1 })
          .limit(30),
        externalJobService.getJobs({
          company: company as string,
          location: location as string,
        }).catch(() => []),
      ]);

      // Normalize internal jobs to same shape
      const internalJobs = internalRaw.map(job => ({
        id: job._id.toString(),
        title: job.title,
        company: (job.company_id as any)?.name || 'Partner Company',
        location: job.location || 'India',
        salary: job.salary,
        description: job.description,
        applyLink: null, // Applied internally through platform
        source: 'internal' as const,
        tag: 'Campus Drive' as const,
        min_cgpa: job.min_cgpa,
        vacancies: job.vacancies,
        requirements: job.requirements,
        fetchedAt: job.created_at?.toISOString() || new Date().toISOString(),
      }));

      const maxResults = Math.min(parseInt(limit as string) || 40, 100);

      res.json({
        success: true,
        internal: {
          count: internalJobs.length,
          jobs: internalJobs,
        },
        external: {
          count: externalJobs.length,
          cache: externalJobService.getCacheStatus(),
          jobs: externalJobs.slice(0, maxResults),
        },
        total: internalJobs.length + externalJobs.length,
      });
    } catch (err: any) {
      console.error("[ExternalJobController] getAll error:", err.message);
      res.status(500).json({ error: "Failed to fetch combined jobs", details: err.message });
    }
  },

  /** GET /api/jobs/external/cache — Admin debug endpoint */
  getCacheStatus: async (_req: AuthRequest, res: Response) => {
    res.json(externalJobService.getCacheStatus());
  },
};
