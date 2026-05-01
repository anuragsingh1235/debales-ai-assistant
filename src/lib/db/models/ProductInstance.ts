import mongoose, { Schema, Document, Types } from 'mongoose';
import { ProductType } from '@/types';

export interface IIntegrationDoc {
  enabled: boolean;
  name: string;
  config: Map<string, string>;
}

export interface IProductInstanceDoc extends Document {
  projectId: Types.ObjectId;
  productType: ProductType;
  name: string;
  namespace: string;
  integrations: {
    shopify: IIntegrationDoc;
    crm: IIntegrationDoc;
  };
  isActive: boolean;
  createdAt: Date;
}

const IntegrationSchema = new Schema<IIntegrationDoc>({
  enabled: { type: Boolean, default: false },
  name: { type: String, default: '' },
  config: { type: Map, of: String, default: {} },
});

const ProductInstanceSchema = new Schema<IProductInstanceDoc>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    productType: {
      type: String,
      enum: ['ai-sales-assistant', 'ai-support-bot', 'ai-analytics'],
      required: true,
    },
    name: { type: String, required: true },
    namespace: { type: String, required: true },
    integrations: {
      shopify: { type: IntegrationSchema, default: () => ({}) },
      crm: { type: IntegrationSchema, default: () => ({}) },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ProductInstance =
  mongoose.models.ProductInstance ||
  mongoose.model<IProductInstanceDoc>('ProductInstance', ProductInstanceSchema);

export default ProductInstance;
