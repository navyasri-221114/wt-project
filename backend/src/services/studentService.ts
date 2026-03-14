import { StudentModel } from "../models/Student.js";
import { UserModel } from "../models/User.js";
import mongoose from "mongoose";

export const StudentService = {
  searchStudents: async (filters: { q?: string, branch?: string, college?: string, year?: number, skills?: string, min_cgpa?: number, is_public_only?: boolean }) => {
    try {
      const matchStage: any = {};

      if (filters.is_public_only) {
        matchStage['studentProfile.is_public'] = 1;
      }
      if (filters.branch) {
        matchStage['studentProfile.branch'] = { $regex: filters.branch, $options: 'i' };
      }
      if (filters.college) {
        matchStage['studentProfile.college'] = { $regex: filters.college, $options: 'i' };
      }
      if (filters.year) {
        matchStage['studentProfile.year'] = Number(filters.year);
      }
      if (filters.skills) {
        matchStage['studentProfile.skills'] = { $regex: filters.skills, $options: 'i' };
      }
      if (filters.min_cgpa) {
        matchStage['studentProfile.cgpa'] = { $gte: Number(filters.min_cgpa) };
      }

      if (filters.q) {
        matchStage.$or = [
          { 'name': { $regex: filters.q, $options: 'i' } },
          { 'studentProfile.skills': { $regex: filters.q, $options: 'i' } },
          { 'studentProfile.department': { $regex: filters.q, $options: 'i' } }
        ];
      }

      const students = await UserModel.aggregate([
        { $match: { role: 'student' } },
        {
          $lookup: {
            from: 'studentprofiles',
            localField: '_id',
            foreignField: 'user_id',
            as: 'studentProfile'
          }
        },
        { $unwind: { path: '$studentProfile', preserveNullAndEmptyArrays: true } },
        // Apply student profile specific filters
        { $match: matchStage },
        {
          $project: {
            id: '$_id',
            name: 1,
            email: 1,
            avatar_url: 1,
            profile: '$studentProfile'
          }
        }
      ]);

      return students;
    } catch(error) {
      console.error("Error in searchStudents:", error);
      return [];
    }
  },

  getStudentById: async (id: string, is_public_only: boolean = false) => {
    try {
      const studentId = new mongoose.Types.ObjectId(id);
      const student = await UserModel.aggregate([
        { $match: { _id: studentId, role: 'student' } },
        {
          $lookup: {
            from: 'studentprofiles',
            localField: '_id',
            foreignField: 'user_id',
            as: 'profile'
          }
        },
        { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } }
      ]).exec();

      if (!student || student.length === 0) return null;
      
      const result = student[0];
      if (is_public_only && result.profile && result.profile.is_public === 0) {
        return { error: "This profile is private" };
      }

      return result;
    } catch(error) {
      console.error("Error in getStudentById:", error);
      return null;
    }
  }
};
