import connectDB from '@/lib/db/mongodb';
import Conversation from '@/lib/db/models/Conversation';
import { IConversation } from '@/types';

function toConversation(doc: Record<string, unknown>): IConversation {
  return {
    _id: String(doc._id),
    projectId: String(doc.projectId),
    productInstanceId: String(doc.productInstanceId),
    userId: String(doc.userId),
    title: doc.title as string,
    createdAt: String(doc.createdAt),
    updatedAt: String(doc.updatedAt),
  };
}

export async function getConversationsByProject(
  projectId: string,
  userId: string
): Promise<IConversation[]> {
  await connectDB();
  const docs = await Conversation.find({ projectId, userId })
    .sort({ updatedAt: -1 })
    .lean();
  return docs.map(toConversation);
}

export async function getConversationById(id: string): Promise<IConversation | null> {
  await connectDB();
  const doc = await Conversation.findById(id).lean();
  if (!doc) return null;
  return toConversation(doc as Record<string, unknown>);
}

export async function createConversation(
  projectId: string,
  productInstanceId: string,
  userId: string,
  title: string
): Promise<IConversation> {
  await connectDB();
  const doc = await Conversation.create({ projectId, productInstanceId, userId, title });
  return toConversation(doc.toObject() as Record<string, unknown>);
}

export async function updateConversationTitle(id: string, title: string): Promise<void> {
  await connectDB();
  await Conversation.findByIdAndUpdate(id, { title });
}
