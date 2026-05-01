import connectDB from '@/lib/db/mongodb';
import Message from '@/lib/db/models/Message';
import { IMessage } from '@/types';

function toMessage(doc: Record<string, unknown>): IMessage {
  return {
    _id: String(doc._id),
    conversationId: String(doc.conversationId),
    role: doc.role as 'user' | 'assistant',
    content: doc.content as string,
    steps: (doc.steps as string[]) || [],
    createdAt: String(doc.createdAt),
  };
}

export async function getMessagesByConversation(conversationId: string): Promise<IMessage[]> {
  await connectDB();
  const docs = await Message.find({ conversationId }).sort({ createdAt: 1 }).lean();
  return docs.map(toMessage);
}

export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  steps: string[] = []
): Promise<IMessage> {
  await connectDB();
  const doc = await Message.create({ conversationId, role, content, steps });
  return toMessage(doc.toObject() as Record<string, unknown>);
}
