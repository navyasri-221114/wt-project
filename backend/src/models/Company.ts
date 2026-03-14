import mongoose, { Document, Schema } from 'mongoose';

export interface ICompanyProfile extends Document {
  user_id: mongoose.Types.ObjectId;
  description?: string;
  website?: string;
  location?: string;
}

const companyProfileSchema = new Schema<ICompanyProfile>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  description: { type: String },
  website: { type: String },
  location: { type: String }
});

export const CompanyModel = mongoose.models.CompanyProfile || mongoose.model<ICompanyProfile>('CompanyProfile', companyProfileSchema);
