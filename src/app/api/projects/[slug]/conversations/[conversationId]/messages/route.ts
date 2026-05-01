import { NextRequest } from 'next/server';
import { getSessionUser, unauthorized, forbidden, notFound } from '@/lib/auth';
import { getProjectBySlug } from '@/lib/services/projectService';
import { getConversationById, updateConversationTitle } from '@/lib/services/conversationService';
import { getMessagesByConversation, saveMessage } from '@/lib/services/messageService';
import { getProductInstanceByProject } from '@/lib/services/productInstanceService';
import { generateAIResponse } from '@/lib/services/aiService';
import { canManageConversations } from '@/lib/access/rules';
import { SendMessageSchema } from '@/lib/validations';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; conversationId: string }> }
) {
  const { slug, conversationId } = await params;

  const user = await getSessionUser();
  if (!user) return unauthorized();

  const project = await getProjectBySlug(slug);
  if (!project) return notFound('Project not found');
  if (!canManageConversations(user, project)) return forbidden();

  const conversation = await getConversationById(conversationId);
  if (!conversation || conversation.projectId !== project._id) {
    return notFound('Conversation not found');
  }

  const body = await req.json();
  const parsed = SendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { content } = parsed.data;

  // Save user message first
  const userMessage = await saveMessage(conversationId, 'user', content);

  // Get conversation history for context
  const history = await getMessagesByConversation(conversationId);

  // Get product instance for integration config
  const productInstance = await getProductInstanceByProject(project._id);

  // Service layer decides when/how to call AI
  const aiResponse = await generateAIResponse(
    content,
    history.slice(0, -1), // exclude the message we just saved
    productInstance?.integrations ?? { shopify: { enabled: false, name: '', config: {} }, crm: { enabled: false, name: '', config: {} } },
    productInstance?.productType ?? 'ai-sales-assistant'
  );

  // Save assistant response
  const assistantMessage = await saveMessage(
    conversationId,
    'assistant',
    aiResponse.content,
    aiResponse.steps
  );

  // Auto-update conversation title from first user message
  if (history.length <= 1 && conversation.title === 'New Conversation') {
    const shortTitle = content.slice(0, 50) + (content.length > 50 ? '...' : '');
    await updateConversationTitle(conversationId, shortTitle);
  }

  return Response.json({ userMessage, assistantMessage });
}
