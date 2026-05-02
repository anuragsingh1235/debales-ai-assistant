import { z } from 'zod';

// --- Auth ---
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// --- Conversations ---
export const CreateConversationSchema = z.object({
  title: z.string().optional().default('New Conversation'),
  productInstanceId: z.string().min(1, 'productInstanceId is required'),
});

// --- Messages ---
export const SendMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(4000, 'Message too long'),
});

// --- Integrations ---
export const UpdateIntegrationsSchema = z.object({
  shopify: z.object({
    enabled: z.boolean(),
    name: z.string().optional().default('Shopify'),
    config: z.record(z.string(), z.string()).optional().default({}),
  }),
  crm: z.object({
    enabled: z.boolean(),
    name: z.string().optional().default('CRM'),
    config: z.record(z.string(), z.string()).optional().default({}),
  }),
});

// --- Dashboard widget ---
export const DashboardWidgetSchema = z.object({
  id: z.string(),
  type: z.enum(['stat-card', 'integration-status', 'activity-feed', 'conversation-list', 'info-banner']),
  title: z.string(),
  order: z.number().default(0),
  config: z.record(z.string(), z.unknown()).default({}),
});

export const DashboardSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  order: z.number().default(0),
  widgets: z.array(DashboardWidgetSchema),
});

export const UpdateDashboardSchema = z.object({
  title: z.string().min(1),
  layout: z.enum(['grid', 'list']).default('grid'),
  sections: z.array(DashboardSectionSchema),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateConversationInput = z.infer<typeof CreateConversationSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type UpdateIntegrationsInput = z.infer<typeof UpdateIntegrationsSchema>;
export type UpdateDashboardInput = z.infer<typeof UpdateDashboardSchema>;
