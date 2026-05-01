/**
 * Seed script - populates MongoDB with demo data
 * Run: npx tsx scripts/seed.ts
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set in .env.local');
  process.exit(1);
}

function hashPassword(password: string): string {
  return Buffer.from(password + ':debales-salt').toString('base64');
}

// --- Schemas (inline for seed script) ---

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  role: String,
  passwordHash: String,
});

const MemberSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, role: String });
const ProjectSchema = new mongoose.Schema({ name: String, slug: { type: String, unique: true }, description: String, members: [MemberSchema] }, { timestamps: true });

const ProductInstanceSchema = new mongoose.Schema({
  projectId: mongoose.Schema.Types.ObjectId,
  productType: String,
  name: String,
  namespace: String,
  integrations: {
    shopify: { enabled: Boolean, name: String, config: Map },
    crm: { enabled: Boolean, name: String, config: Map },
  },
  isActive: Boolean,
});

const ConversationSchema = new mongoose.Schema({
  projectId: mongoose.Schema.Types.ObjectId,
  productInstanceId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  title: String,
}, { timestamps: true });

const MessageSchema = new mongoose.Schema({
  conversationId: mongoose.Schema.Types.ObjectId,
  role: String,
  content: String,
  steps: [String],
}, { timestamps: true });

const WidgetSchema = new mongoose.Schema({ id: String, type: String, title: String, order: Number, config: { type: Map, of: mongoose.Schema.Types.Mixed } });
const SectionSchema = new mongoose.Schema({ id: String, title: String, order: Number, widgets: [WidgetSchema] });
const DashboardConfigSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, unique: true },
  title: String,
  layout: String,
  sections: [SectionSchema],
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
const ProductInstance = mongoose.models.ProductInstance || mongoose.model('ProductInstance', ProductInstanceSchema);
const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
const DashboardConfig = mongoose.models.DashboardConfig || mongoose.model('DashboardConfig', DashboardConfigSchema);

async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    ProductInstance.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
    DashboardConfig.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // --- Create Users ---
  const adminUser = await User.create({
    name: 'Anurag Singh',
    email: 'admin@debales.ai',
    role: 'admin',
    passwordHash: hashPassword('admin123'),
  });

  const memberUser = await User.create({
    name: 'Test Member',
    email: 'member@debales.ai',
    role: 'member',
    passwordHash: hashPassword('member123'),
  });

  console.log('👥 Created users');

  // --- Create Projects ---
  const shopbotProject = await Project.create({
    name: 'ShopBot Pro',
    slug: 'shopbot-pro',
    description: 'AI-powered sales assistant for e-commerce stores. Handles order queries, product recommendations, and customer support.',
    members: [
      { userId: adminUser._id, role: 'admin' },
      { userId: memberUser._id, role: 'member' },
    ],
  });

  const salesProject = await Project.create({
    name: 'SalesForce AI',
    slug: 'salesforce-ai',
    description: 'Intelligent CRM assistant that helps sales teams close more deals with AI-driven insights and pipeline management.',
    members: [
      { userId: adminUser._id, role: 'admin' },
    ],
  });

  console.log('📁 Created projects');

  // --- Create Product Instances ---
  const shopbotInstance = await ProductInstance.create({
    projectId: shopbotProject._id,
    productType: 'ai-sales-assistant',
    name: 'ShopBot Sales AI',
    namespace: 'shopbot-pro',
    integrations: {
      shopify: { enabled: true, name: 'Shopify Store', config: new Map([['shopDomain', 'mystore.myshopify.com']]) },
      crm: { enabled: false, name: 'HubSpot CRM', config: new Map() },
    },
    isActive: true,
  });

  const salesInstance = await ProductInstance.create({
    projectId: salesProject._id,
    productType: 'ai-support-bot',
    name: 'SalesForce Assistant',
    namespace: 'salesforce-ai',
    integrations: {
      shopify: { enabled: false, name: 'Shopify', config: new Map() },
      crm: { enabled: true, name: 'Salesforce CRM', config: new Map([['crmUrl', 'https://myorg.salesforce.com']]) },
    },
    isActive: true,
  });

  console.log('🔌 Created product instances');

  // --- Create sample conversations ---
  const conv1 = await Conversation.create({
    projectId: shopbotProject._id,
    productInstanceId: shopbotInstance._id,
    userId: adminUser._id,
    title: 'What are my top selling products?',
  });

  await Message.create([
    { conversationId: conv1._id, role: 'user', content: 'What are my top selling products?', steps: [] },
    {
      conversationId: conv1._id,
      role: 'assistant',
      content: 'Based on your Shopify data, your top 3 selling products are:\n\n1. **AirPods Pro** — 156 units sold\n2. **MacBook Stand** — 98 units sold\n3. **USB-C Hub** — 87 units sold\n\nAirPods Pro is leading by a significant margin. Would you like me to analyze pricing or reorder recommendations?',
      steps: ['Analyzing your query...', 'Fetching Shopify store data...', 'Generating response...'],
    },
  ]);

  const conv2 = await Conversation.create({
    projectId: shopbotProject._id,
    productInstanceId: shopbotInstance._id,
    userId: adminUser._id,
    title: 'Low stock alerts',
  });

  await Message.create([
    { conversationId: conv2._id, role: 'user', content: 'Any low stock alerts I should know about?', steps: [] },
    {
      conversationId: conv2._id,
      role: 'assistant',
      content: '⚠️ **Inventory Alert**: Your **Wireless Charger** is running critically low with only **3 units** remaining.\n\nI recommend placing a reorder soon to avoid stockouts, especially given the current sales velocity.',
      steps: ['Analyzing your query...', 'Fetching Shopify store data...', 'Generating response...'],
    },
  ]);

  console.log('💬 Created sample conversations');

  // --- Create Dashboard Configs (THE KEY PART) ---
  // This is the MongoDB document that drives the admin dashboard UI.
  // Edit it in Atlas → changes appear in the dashboard without any code deploy.

  await DashboardConfig.create({
    projectId: shopbotProject._id,
    title: 'ShopBot Pro Dashboard',
    layout: 'grid',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        order: 1,
        widgets: [
          { id: 'total-conv', type: 'stat-card', title: 'Total Conversations', order: 1, config: new Map([['icon', 'chat'], ['color', 'violet'], ['value', '24'], ['change', '+12%']]) },
          { id: 'active-users', type: 'stat-card', title: 'Active Users', order: 2, config: new Map([['icon', 'users'], ['color', 'blue'], ['value', '1,243'], ['change', '+5%']]) },
          { id: 'revenue', type: 'stat-card', title: "Today's Revenue", order: 3, config: new Map([['icon', 'zap'], ['color', 'green'], ['value', '$2,847'], ['change', '+18%']]) },
        ],
      },
      {
        id: 'integrations',
        title: 'Integration Status',
        order: 2,
        widgets: [
          { id: 'shopify-status', type: 'integration-status', title: 'Shopify Store', order: 1, config: new Map([['integration', 'shopify'], ['enabled', true]]) },
          { id: 'crm-status', type: 'integration-status', title: 'HubSpot CRM', order: 2, config: new Map([['integration', 'crm'], ['enabled', false]]) },
        ],
      },
      {
        id: 'activity',
        title: 'Recent Activity',
        order: 3,
        widgets: [
          {
            id: 'activity-feed',
            type: 'activity-feed',
            title: 'Activity Feed',
            order: 1,
            config: new Map([
              ['items', [
                { text: 'User asked about top products', time: '2m ago' },
                { text: 'Shopify inventory checked', time: '8m ago' },
                { text: 'New conversation started', time: '15m ago' },
                { text: 'Revenue report queried', time: '1h ago' },
              ]],
            ]),
          },
        ],
      },
      {
        id: 'notices',
        title: 'Notices',
        order: 4,
        widgets: [
          {
            id: 'info-banner',
            type: 'info-banner',
            title: 'Config-driven Notice',
            order: 1,
            config: new Map([['message', '✅ This entire dashboard is driven by a MongoDB document. Edit the DashboardConfig collection to change sections, widgets, and layout — no code deploy required.'], ['variant', 'info']]),
          },
        ],
      },
    ],
  });

  await DashboardConfig.create({
    projectId: salesProject._id,
    title: 'SalesForce AI Dashboard',
    layout: 'grid',
    sections: [
      {
        id: 'pipeline',
        title: 'Pipeline Overview',
        order: 1,
        widgets: [
          { id: 'pipeline-value', type: 'stat-card', title: 'Pipeline Value', order: 1, config: new Map([['icon', 'zap'], ['color', 'violet'], ['value', '$187,500'], ['change', '+8%']]) },
          { id: 'win-rate', type: 'stat-card', title: 'Win Rate', order: 2, config: new Map([['icon', 'activity'], ['color', 'green'], ['value', '34%'], ['change', '+3%']]) },
          { id: 'hot-leads', type: 'stat-card', title: 'Hot Leads', order: 3, config: new Map([['icon', 'users'], ['color', 'orange'], ['value', '7'], ['change', 'New']]) },
        ],
      },
      {
        id: 'crm-status',
        title: 'CRM Integration',
        order: 2,
        widgets: [
          { id: 'crm-integration', type: 'integration-status', title: 'Salesforce CRM', order: 1, config: new Map([['integration', 'crm'], ['enabled', true]]) },
          { id: 'shopify-integration', type: 'integration-status', title: 'Shopify', order: 2, config: new Map([['integration', 'shopify'], ['enabled', false]]) },
        ],
      },
      {
        id: 'sales-activity',
        title: 'Sales Activity',
        order: 3,
        widgets: [
          {
            id: 'sales-feed',
            type: 'activity-feed',
            title: 'Sales Activity',
            order: 1,
            config: new Map([
              ['items', [
                { text: 'GlobalCo deal closed — $22,000', time: '30m ago' },
                { text: 'Follow-up scheduled with Acme Corp', time: '1h ago' },
                { text: 'TechStart proposal sent', time: '2h ago' },
                { text: 'LinkedIn leads imported', time: '3h ago' },
              ]],
            ]),
          },
        ],
      },
    ],
  });

  console.log('📊 Created dashboard configs');
  console.log('\n✅ Seed complete!\n');
  console.log('Demo credentials:');
  console.log('  Admin  → admin@debales.ai  / admin123');
  console.log('  Member → member@debales.ai / member123');
  console.log('\nProjects:');
  console.log('  shopbot-pro   → /projects/shopbot-pro/chat');
  console.log('  salesforce-ai → /projects/salesforce-ai/chat');
  console.log('\nAdmin dashboard collection: DashboardConfig');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
