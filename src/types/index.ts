export type UserRole = 'admin' | 'member';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface IMember {
  userId: string;
  role: UserRole;
}

export interface IProject {
  _id: string;
  name: string;
  slug: string;
  description: string;
  members: IMember[];
  createdAt: string;
}

export type ProductType = 'ai-sales-assistant' | 'ai-support-bot' | 'ai-analytics';

export interface IIntegrationConfig {
  enabled: boolean;
  name: string;
  config: Record<string, string>;
}

export interface IIntegrations {
  shopify: IIntegrationConfig;
  crm: IIntegrationConfig;
}

export interface IProductInstance {
  _id: string;
  projectId: string;
  productType: ProductType;
  name: string;
  namespace: string;
  integrations: IIntegrations;
  isActive: boolean;
}

export interface IConversation {
  _id: string;
  projectId: string;
  productInstanceId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export type MessageRole = 'user' | 'assistant';

export interface IMessage {
  _id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  steps?: string[];
  createdAt: string;
}

export type WidgetType =
  | 'stat-card'
  | 'integration-status'
  | 'activity-feed'
  | 'conversation-list'
  | 'info-banner';

export interface IDashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  order: number;
  config: Record<string, unknown>;
}

export interface IDashboardSection {
  id: string;
  title: string;
  order: number;
  widgets: IDashboardWidget[];
}

export interface IDashboardConfig {
  _id: string;
  projectId: string;
  title: string;
  layout: 'grid' | 'list';
  sections: IDashboardSection[];
}

export interface ApiError {
  error: string;
  status?: number;
}

export interface AuthSession {
  userId: string;
  email: string;
  role: UserRole;
}
