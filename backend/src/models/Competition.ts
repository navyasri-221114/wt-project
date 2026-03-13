import mongoose, { Document, Schema } from 'mongoose';

export interface ICompetition extends Document {
  name: string;
  organizer: string;
  date: string;
  participants: string;
  prize: string;
  category: 'Coding' | 'Hackathon' | 'Cloud' | 'Other';
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Advanced' | 'Extreme';
  tags: string[];
  link?: string;
  created_at: Date;
}

const competitionSchema = new Schema<ICompetition>({
  name: { type: String, required: true },
  organizer: { type: String, required: true },
  date: { type: String, required: true },
  participants: { type: String, default: "0" },
  prize: { type: String, required: true },
  category: { type: String, enum: ['Coding', 'Hackathon', 'Cloud', 'Other'], default: 'Coding' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Advanced', 'Extreme'], default: 'Medium' },
  tags: [{ type: String }],
  link: { type: String },
  created_at: { type: Date, default: Date.now }
});

export const CompetitionModel = mongoose.models.Competition || mongoose.model<ICompetition>('Competition', competitionSchema);
