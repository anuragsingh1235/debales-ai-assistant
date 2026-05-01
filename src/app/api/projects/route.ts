import { getSessionUser, unauthorized } from '@/lib/auth';
import { getProjectsForUser } from '@/lib/services/projectService';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const projects = await getProjectsForUser(user._id);
  return Response.json({ projects });
}
