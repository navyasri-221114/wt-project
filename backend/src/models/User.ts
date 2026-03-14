import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'company' | 'admin';
  avatar_url?: string;
  created_at: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // optional for now to match interface
  role: { type: String, enum: ['student', 'company', 'admin'], required: true },
  avatar_url: { type: String, default: null },
  created_at: { type: Date, default: Date.now }
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
