import connectDB from '@/lib/db/mongodb';
import DashboardConfig from '@/lib/db/models/DashboardConfig';
import { IDashboardConfig } from '@/types';

function toConfig(doc: Record<string, unknown>): IDashboardConfig {
  const sections = (doc.sections as Array<Record<string, unknown>>).map((s) => ({
    id: s.id as string,
    title: s.title as string,
    order: s.order as number,
    widgets: (s.widgets as Array<Record<string, unknown>>).map((w) => ({
      id: w.id as string,
      type: w.type as IDashboardConfig['sections'][0]['widgets'][0]['type'],
      title: w.title as string,
      order: w.order as number,
      config: w.config instanceof Map ? Object.fromEntries(w.config) : (w.config as Record<string, unknown>),
    })),
  }));

  return {
    _id: String(doc._id),
    projectId: String(doc.projectId),
    title: doc.title as string,
    layout: doc.layout as 'grid' | 'list',
    sections,
  };
}

export async function getDashboardConfig(projectId: string): Promise<IDashboardConfig | null> {
  await connectDB();
  const doc = await DashboardConfig.findOne({ projectId }).lean();
  if (!doc) return null;
  return toConfig(doc as Record<string, unknown>);
}

export async function upsertDashboardConfig(
  projectId: string,
  data: Omit<IDashboardConfig, '_id' | 'projectId'>
): Promise<IDashboardConfig> {
  await connectDB();
  const doc = await DashboardConfig.findOneAndUpdate(
    { projectId },
    { ...data, projectId },
    { upsert: true, new: true }
  ).lean();
  return toConfig(doc as Record<string, unknown>);
}
