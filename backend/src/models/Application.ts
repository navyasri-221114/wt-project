import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  job_id: mongoose.Types.ObjectId;
  student_id: mongoose.Types.ObjectId;
  status: 'applied' | 'shortlisted' | 'interview_scheduled' | 'selected' | 'rejected';
  created_at: Date;
}

const applicationSchema = new Schema<IApplication>({
  job_id: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  student_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'applied' },
  created_at: { type: Date, default: Date.now }
});

// Ensure unique application per job and student
applicationSchema.index({ job_id: 1, student_id: 1 }, { unique: true });

export const ApplicationModel = mongoose.models.Application || mongoose.model<IApplication>('Application', applicationSchema);
