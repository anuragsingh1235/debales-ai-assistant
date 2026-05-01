import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMemberDoc {
  userId: Types.ObjectId;
  role: 'admin' | 'member';
}

export interface IProjectDoc extends Document {
  name: string;
  slug: string;
  description: string;
  members: IMemberDoc[];
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMemberDoc>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
});

const ProjectSchema = new Schema<IProjectDoc>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    members: [MemberSchema],
  },
  { timestamps: true }
);

const Project =
  mongoose.models.Project || mongoose.model<IProjectDoc>('Project', ProjectSchema);
export default Project;
