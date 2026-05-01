import connectDB from '@/lib/db/mongodb';
import Project from '@/lib/db/models/Project';
import { IProject } from '@/types';

function toProject(doc: Record<string, unknown> & { _id: unknown; members: Array<{ userId: unknown; role: unknown }> }): IProject {
  return {
    _id: String(doc._id),
    name: doc.name as string,
    slug: doc.slug as string,
    description: doc.description as string,
    members: doc.members.map((m) => ({
      userId: String(m.userId),
      role: m.role as 'admin' | 'member',
    })),
    createdAt: String(doc.createdAt),
  };
}

export async function getProjectBySlug(slug: string): Promise<IProject | null> {
  await connectDB();
  const doc = await Project.findOne({ slug }).lean();
  if (!doc) return null;
  return toProject(doc as Parameters<typeof toProject>[0]);
}

export async function getProjectsForUser(userId: string): Promise<IProject[]> {
  await connectDB();
  const docs = await Project.find({ 'members.userId': userId }).lean();
  return docs.map((d) => toProject(d as Parameters<typeof toProject>[0]));
}

export async function getProjectById(id: string): Promise<IProject | null> {
  await connectDB();
  const doc = await Project.findById(id).lean();
  if (!doc) return null;
  return toProject(doc as Parameters<typeof toProject>[0]);
}
