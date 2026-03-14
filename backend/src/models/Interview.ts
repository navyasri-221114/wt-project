import mongoose, { Document, Schema } from 'mongoose';

export interface IInterview extends Document {
  application_id: mongoose.Types.ObjectId;
  scheduled_at: Date;
  room_id: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  recruiter_notes?: string;
  evaluation_rating?: number;
  created_at: Date;
}

const interviewSchema = new Schema<IInterview>({
  application_id: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
  scheduled_at: { type: Date, required: true },
  room_id: { type: String, required: true, unique: true },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  recruiter_notes: { type: String },
  evaluation_rating: { type: Number },
  created_at: { type: Date, default: Date.now }
});

export const InterviewModel = mongoose.models.Interview || mongoose.model<IInterview>('Interview', interviewSchema);
