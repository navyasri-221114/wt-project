import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentProfile extends Document {
  user_id: mongoose.Types.ObjectId;
  department?: string;
  branch?: string;
  college?: string;
  year?: number;
  cgpa?: number;
  skills?: string;
  certifications?: string;
  projects?: string;
  resume_url?: string;
  linkedin_url?: string;
  github_url?: string;
  is_public: number;
}

const studentProfileSchema = new Schema<IStudentProfile>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  department: { type: String },
  branch: { type: String },
  college: { type: String },
  year: { type: Number },
  cgpa: { type: Number },
  skills: { type: String },
  certifications: { type: String },
  projects: { type: String },
  resume_url: { type: String },
  linkedin_url: { type: String },
  github_url: { type: String },
  is_public: { type: Number, default: 1 }
});

export const StudentModel = mongoose.models.StudentProfile || mongoose.model<IStudentProfile>('StudentProfile', studentProfileSchema);
