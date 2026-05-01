import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessageDoc extends Document {
  conversationId: Types.ObjectId;
  role: 'user' | 'assistant';
  content: string;
  steps: string[]; // e.g. ["Analyzing query...", "Calling Shopify integration..."]
  createdAt: Date;
}

const MessageSchema = new Schema<IMessageDoc>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    steps: [{ type: String }],
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

const Message =
  mongoose.models.Message || mongoose.model<IMessageDoc>('Message', MessageSchema);

export default Message;
