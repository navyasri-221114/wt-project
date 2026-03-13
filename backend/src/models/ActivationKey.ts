import mongoose, { Document, Schema } from 'mongoose';

export interface IActivationKey extends Document {
  key: string;
  status: 'active' | 'used' | 'inactive';
  assigned_to?: string;
  created_at: Date;
}

const activationKeySchema = new Schema<IActivationKey>({
  key: { type: String, required: true, unique: true },
  status: { type: String, enum: ['active', 'used', 'inactive'], default: 'active' },
  assigned_to: { type: String },
  created_at: { type: Date, default: Date.now }
});

export const ActivationKeyModel = mongoose.models.ActivationKey || mongoose.model<IActivationKey>('ActivationKey', activationKeySchema);
