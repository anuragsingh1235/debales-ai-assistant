import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IConversationDoc extends Document {
  projectId: Types.ObjectId;
  productInstanceId: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversationDoc>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    productInstanceId: { type: Schema.Types.ObjectId, ref: 'ProductInstance', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'New Conversation' },
  },
  { timestamps: true }
);

// index for fast queries scoped to project
ConversationSchema.index({ projectId: 1, userId: 1 });

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model<IConversationDoc>('Conversation', ConversationSchema);

export default Conversation;
