import connectDB from '@/lib/db/mongodb';
import ProductInstance from '@/lib/db/models/ProductInstance';
import { IProductInstance, IIntegrations } from '@/types';

function toProductInstance(doc: Record<string, unknown>): IProductInstance {
  const integrations = doc.integrations as Record<string, Record<string, unknown>>;
  return {
    _id: String(doc._id),
    projectId: String(doc.projectId),
    productType: doc.productType as IProductInstance['productType'],
    name: doc.name as string,
    namespace: doc.namespace as string,
    integrations: {
      shopify: {
        enabled: Boolean(integrations?.shopify?.enabled),
        name: String(integrations?.shopify?.name || 'Shopify'),
        config: integrations?.shopify?.config instanceof Map
          ? Object.fromEntries(integrations.shopify.config as Map<string, string>)
          : (integrations?.shopify?.config as Record<string, string>) || {},
      },
      crm: {
        enabled: Boolean(integrations?.crm?.enabled),
        name: String(integrations?.crm?.name || 'CRM'),
        config: integrations?.crm?.config instanceof Map
          ? Object.fromEntries(integrations.crm.config as Map<string, string>)
          : (integrations?.crm?.config as Record<string, string>) || {},
      },
    },
    isActive: Boolean(doc.isActive),
  };
}

export async function getProductInstanceByProject(
  projectId: string
): Promise<IProductInstance | null> {
  await connectDB();
  const doc = await ProductInstance.findOne({ projectId, isActive: true }).lean();
  if (!doc) return null;
  return toProductInstance(doc as Record<string, unknown>);
}

export async function updateIntegrations(
  projectId: string,
  integrations: IIntegrations
): Promise<IProductInstance | null> {
  await connectDB();
  const doc = await ProductInstance.findOneAndUpdate(
    { projectId },
    { integrations },
    { new: true }
  ).lean();
  if (!doc) return null;
  return toProductInstance(doc as Record<string, unknown>);
}
