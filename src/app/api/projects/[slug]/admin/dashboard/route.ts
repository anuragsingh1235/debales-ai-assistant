import { NextRequest } from 'next/server';
import { getSessionUser, unauthorized, forbidden, notFound } from '@/lib/auth';
import { getProjectBySlug } from '@/lib/services/projectService';
import { getDashboardConfig, upsertDashboardConfig } from '@/lib/services/dashboardService';
import { canAccessAdminDashboard, canUpdateDashboardConfig } from '@/lib/access/rules';
import { UpdateDashboardSchema } from '@/lib/validations';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const user = await getSessionUser();
  if (!user) return unauthorized();

  const project = await getProjectBySlug(slug);
  if (!project) return notFound('Project not found');

  // Admin only route
  if (!canAccessAdminDashboard(user, project)) {
    return forbidden('Admin access required');
  }

  const config = await getDashboardConfig(project._id);
  return Response.json({ config });
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

  if (!canUpdateDashboardConfig(user, project)) {
    return forbidden('Admin access required');
  }

  const body = await req.json();
  const parsed = UpdateDashboardSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const config = await upsertDashboardConfig(project._id, parsed.data);
  return Response.json({ config });
}
