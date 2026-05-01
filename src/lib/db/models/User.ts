import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@/types';

export interface IUserDoc extends Document {
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string; // simple hash for demo auth
  createdAt: Date;
}

const UserSchema = new Schema<IUserDoc>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model<IUserDoc>('User', UserSchema);
export default User;
