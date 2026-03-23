import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { UserService } from "../services/userService.js";
import { StudentService } from "../services/studentService.js";
import { UserModel } from "../models/User.js";
import { CompanyModel } from "../models/Company.js";
import { StudentModel } from "../models/Student.js";

export const userController = {
  getProfile: async (req: AuthRequest, res: Response) => {
    try {
      const profile = await UserService.getUserProfile(req.user!.id, req.user!.role);
      if (!profile) return res.status(404).json({ error: "User not found" });
      res.json(profile);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch profile", details: err.message });
    }
  },

  updateProfile: async (req: AuthRequest, res: Response) => {
    try {
      const success = await UserService.updateUserProfile(req.user!.id, req.user!.role, req.body);
      if (!success) return res.status(400).json({ error: "Failed to update profile" });
      res.json({ message: "Profile updated" });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update profile", details: err.message });
    }
  },

  searchStudents: async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'admin' && req.user?.role !== 'company') {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    const { q, branch, college, year, skills, min_cgpa } = req.query;
    
    try {
      const students = await StudentService.searchStudents({
        q: q as string,
        branch: branch as string,
        college: college as string,
        year: year ? parseInt(year as string) : undefined,
        skills: skills as string,
        min_cgpa: min_cgpa ? parseFloat(min_cgpa as string) : undefined,
        is_public_only: req.user.role === 'company'
      });

      res.json(students);
    } catch (err: any) {
      res.status(500).json({ error: "Search failed", details: err.message });
    }
  },

  getStudentById: async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'admin' && req.user?.role !== 'company') {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { id } = req.params;
    try {
      const result = await StudentService.getStudentById(id, req.user.role === 'company');
      if (!result) return res.status(404).json({ error: "Student not found" });
      if ((result as any).error) return res.status(403).json({ error: (result as any).error });

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch student profile", details: err.message });
    }
  },

  getAllCompanies: async (req: AuthRequest, res: Response) => {
    try {
      const companies = await UserModel.find({ role: 'company' }).select('-password');
      const userIds = companies.map(c => c._id);
      const profiles = await CompanyModel.find({ user_id: { $in: userIds } });

      const result = companies.map(company => {
        const profile = profiles.find(p => p.user_id.toString() === company._id.toString());
        return {
          ...company.toObject(),
          id: company._id.toString(),
          ...profile?.toObject()
        };
      });

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch companies", details: err.message });
    }
  },

  toggleSaveJob: async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'student') return res.status(403).json({ error: "Forbidden" });
    const { jobId } = req.body;
    try {
      const student = await StudentModel.findOne({ user_id: req.user.id });
      if (!student) return res.status(404).json({ error: "Student profile not found" });

      const savedJobs = student.saved_jobs || [];
      const jobIndex = savedJobs.findIndex(id => id.toString() === jobId);

      if (jobIndex > -1) {
        savedJobs.splice(jobIndex, 1);
      } else {
        savedJobs.push(jobId as any);
      }

      student.saved_jobs = savedJobs;
      await student.save();

      res.json({ message: jobIndex > -1 ? "Job removed from saved" : "Job saved successfully", saved_jobs: student.saved_jobs });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to toggle save job", details: err.message });
    }
  }
};
