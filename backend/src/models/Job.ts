import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  company_id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  requirements?: string;
  salary?: string;
  location?: string;
  min_cgpa?: number;
  vacancies: number;
  status: 'open' | 'closed';
  created_at: Date;
}

const jobSchema = new Schema<IJob>({
  company_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  requirements: { type: String },
  salary: { type: String },
  location: { type: String },
  min_cgpa: { type: Number, default: 0 },
  vacancies: { type: Number, default: 1 },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  created_at: { type: Date, default: Date.now }
});

export const JobModel = mongoose.models.Job || mongoose.model<IJob>('Job', jobSchema);
