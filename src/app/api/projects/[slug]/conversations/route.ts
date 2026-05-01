import { NextRequest } from 'next/server';
import { getSessionUser, unauthorized, forbidden, notFound } from '@/lib/auth';
import { getProjectBySlug } from '@/lib/services/projectService';
import { getConversationsByProject, createConversation } from '@/lib/services/conversationService';
import { canManageConversations } from '@/lib/access/rules';
import { CreateConversationSchema } from '@/lib/validations';
import { getProductInstanceByProject } from '@/lib/services/productInstanceService';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const user = await getSessionUser();
  if (!user) return unauthorized();

  const project = await getProjectBySlug(slug);
  if (!project) return notFound('Project not found');
  if (!canManageConversations(user, project)) return forbidden();

  const conversations = await getConversationsByProject(project._id, user._id);
  return Response.json({ conversations });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const user = await getSessionUser();
  if (!user) return unauthorized();

  const project = await getProjectBySlug(slug);
  if (!project) return notFound('Project not found');
  if (!canManageConversations(user, project)) return forbidden();

  const body = await req.json();
  const parsed = CreateConversationSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  // grab the product instance if not provided
  let productInstanceId = parsed.data.productInstanceId;
  if (!productInstanceId) {
    const instance = await getProductInstanceByProject(project._id);
    productInstanceId = instance?._id ?? '';
  }

  const conversation = await createConversation(
    project._id,
    productInstanceId,
    user._id,
    parsed.data.title
  );

  return Response.json({ conversation }, { status: 201 });
}
