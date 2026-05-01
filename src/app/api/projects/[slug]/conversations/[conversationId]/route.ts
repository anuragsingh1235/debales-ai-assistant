import { NextRequest } from 'next/server';
import { getSessionUser, unauthorized, forbidden, notFound } from '@/lib/auth';
import { getProjectBySlug } from '@/lib/services/projectService';
import { getConversationById } from '@/lib/services/conversationService';
import { getMessagesByConversation } from '@/lib/services/messageService';
import { canManageConversations } from '@/lib/access/rules';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; conversationId: string }> }
) {
  const { slug, conversationId } = await params;

  const user = await getSessionUser();
  if (!user) return unauthorized();

  const project = await getProjectBySlug(slug);
  if (!project) return notFound('Project not found');
  if (!canManageConversations(user, project)) return forbidden();

  const conversation = await getConversationById(conversationId);
  if (!conversation) return notFound('Conversation not found');

  // Make sure this conversation belongs to this project
  if (conversation.projectId !== project._id) return forbidden();

  const messages = await getMessagesByConversation(conversationId);

  return Response.json({ conversation, messages });
}
