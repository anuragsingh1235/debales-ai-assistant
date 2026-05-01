import { NextRequest } from 'next/server';
import { getSessionUser, unauthorized, forbidden, notFound } from '@/lib/auth';
import { getProjectBySlug } from '@/lib/services/projectService';
import { getProductInstanceByProject, updateIntegrations } from '@/lib/services/productInstanceService';
import { canAccessProject, canUpdateIntegrations } from '@/lib/access/rules';
import { UpdateIntegrationsSchema } from '@/lib/validations';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const user = await getSessionUser();
  if (!user) return unauthorized();

  const project = await getProjectBySlug(slug);
  if (!project) return notFound('Project not found');
  if (!canAccessProject(user, project)) return forbidden();

  const instance = await getProductInstanceByProject(project._id);
  return Response.json({ integrations: instance?.integrations ?? null, instance });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const user = await getSessionUser();
  if (!user) return unauthorized();

  const project = await getProjectBySlug(slug);
  if (!project) return notFound('Project not found');

  // Only admins can toggle integrations
  if (!canUpdateIntegrations(user, project)) return forbidden('Only admins can update integrations');

  const body = await req.json();
  const parsed = UpdateIntegrationsSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const updated = await updateIntegrations(project._id, parsed.data as never);
  return Response.json({ integrations: updated?.integrations });
}
