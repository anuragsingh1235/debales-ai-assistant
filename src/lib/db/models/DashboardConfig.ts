import mongoose, { Schema, Document, Types } from 'mongoose';

// This is the core of config-driven UI.
// Admin edits this document in MongoDB → dashboard UI changes without any code deploy.

export interface IWidgetDoc {
  id: string;
  type: 'stat-card' | 'integration-status' | 'activity-feed' | 'conversation-list' | 'info-banner';
  title: string;
  order: number;
  config: Map<string, unknown>;
}

export interface ISectionDoc {
  id: string;
  title: string;
  order: number;
  widgets: IWidgetDoc[];
}

export interface IDashboardConfigDoc extends Document {
  projectId: Types.ObjectId;
  title: string;
  layout: 'grid' | 'list';
  sections: ISectionDoc[];
  updatedAt: Date;
}

const WidgetSchema = new Schema<IWidgetDoc>({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ['stat-card', 'integration-status', 'activity-feed', 'conversation-list', 'info-banner'],
    required: true,
  },
  title: { type: String, required: true },
  order: { type: Number, default: 0 },
  config: { type: Map, of: Schema.Types.Mixed, default: {} },
});

const SectionSchema = new Schema<ISectionDoc>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  order: { type: Number, default: 0 },
  widgets: [WidgetSchema],
});

const DashboardConfigSchema = new Schema<IDashboardConfigDoc>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
    title: { type: String, required: true },
    layout: { type: String, enum: ['grid', 'list'], default: 'grid' },
    sections: [SectionSchema],
  },
  { timestamps: true }
);

const DashboardConfig =
  mongoose.models.DashboardConfig ||
  mongoose.model<IDashboardConfigDoc>('DashboardConfig', DashboardConfigSchema);

export default DashboardConfig;
