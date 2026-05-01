import { NextRequest } from 'next/server';
import { getSessionUser, unauthorized, forbidden, notFound } from '@/lib/auth';
import { getProjectBySlug } from '@/lib/services/projectService';
import { canAccessProject } from '@/lib/access/rules';

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

  return Response.json({ project });
}
