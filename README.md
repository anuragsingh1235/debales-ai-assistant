# Debales AI — Multi-tenant AI Assistant

A full-stack multi-tenant AI assistant platform built with Next.js App Router, MongoDB, and Google Gemini. Each project acts as an isolated tenant with scoped conversations, role-based access, and a config-driven admin dashboard.

**Built by:** Anurag Singh (anuragsinghmd123@gmail.com)

---

## 🚀 Live Demo & Walkthrough
- **Live Vercel App:** [https://debales-ai-assistant.vercel.app](https://debales-ai-assistant.vercel.app) *(Check Vercel for your exact domain)*
- **Loom Walkthrough Video:** `[INSERT_YOUR_LOOM_LINK_HERE]`

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/anuragsingh1235/debales-ai-assistant.git
cd debales-ai-assistant
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string (standard or SRV format) |
| `GEMINI_API_KEY` | Google Gemini API key (free tier works fine) |
| `NEXT_PUBLIC_APP_URL` | App URL (http://localhost:3000 for local) |

> **Note on MongoDB URI:** If you're on a network that blocks SRV DNS lookups (common in universities/offices), use the standard connection string format instead of `mongodb+srv://`. You can get it from MongoDB Atlas → Connect → Drivers → toggle off "SRV Connection String".

### 3. Seed the Database

This populates MongoDB with demo users, projects, product instances, conversations, and dashboard configs.

```bash
npm run seed
```

What gets created:
- **2 Users:** admin@debales.ai (password: admin123) and member@debales.ai (password: member123)
- **2 Projects:** ShopBot Pro and SalesForce AI
- **Product instances** with Shopify + CRM integrations configured
- **Sample conversations** with AI responses
- **DashboardConfig documents** for each project (this drives the admin UI)

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with the demo credentials above.

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@debales.ai | admin123 |
| Member | member@debales.ai | member123 |

The login page has quick-fill buttons so reviewers don't need to type credentials.

---

## Architecture

### Multi-tenant Model

```
Project (tenant boundary, identified by slug)
  └── Members (userId + role: admin | member)
  └── ProductInstance (productType, integrations config)
  └── Conversations (scoped to project + productInstance + user)
       └── Messages (user/assistant, with optional step lines)
  └── DashboardConfig (drives admin dashboard UI)
```

Every API route enforces project scoping — a user can only access data belonging to projects they are members of.

### Layered API Architecture

```
UI Components
    ↑ (uses)
TanStack Query Hooks  [src/hooks/]
    ↑ (calls)
API Route Handlers    [src/app/api/]  ← thin, just orchestration
    ↑ (uses)
Access Layer          [src/lib/access/rules.ts]  ← pure functions, no side effects
Services Layer        [src/lib/services/]        ← business logic + DB access
    ↑ (uses)
Mongoose Models       [src/lib/db/models/]
```

Every request flow:
1. **Route handler** — gets session user, parses + validates input with Zod
2. **Access layer** — pure function checks (canAccessProject, isProjectAdmin, etc.)
3. **Service layer** — does the actual DB query or AI call
4. **Return** — serialized JSON response

### Key Files

```
src/
├── lib/
│   ├── access/rules.ts          # Pure access rule functions
│   ├── services/
│   │   ├── aiService.ts         # Gemini API integration + fallbacks
│   │   ├── dashboardService.ts  # Reads/writes DashboardConfig collection
│   │   └── ...
│   ├── db/models/
│   │   ├── DashboardConfig.ts   # THE config-driven dashboard schema
│   │   └── ...
│   └── validations/index.ts     # All Zod schemas
├── app/api/
│   └── projects/[slug]/
│       ├── conversations/       # Conversation CRUD
│       ├── integrations/        # Integration toggle routes
│       └── admin/dashboard/     # Config-driven dashboard API (admin only)
├── components/
│   ├── admin/ConfigDrivenDashboard.tsx  # Renders widgets from MongoDB config
│   └── chat/                            # Chat shell, messages, input
└── hooks/                               # TanStack Query hooks (all server state here)
```

---

## Config-Driven Admin Dashboard

**This is the core demo-able feature of the assignment.**

### Which collection drives it

The `DashboardConfig` collection in MongoDB. Each document has this structure:

```json
{
  "projectId": "<ObjectId>",
  "title": "ShopBot Pro Dashboard",
  "layout": "grid",
  "sections": [
    {
      "id": "overview",
      "title": "Overview",
      "order": 1,
      "widgets": [
        {
          "id": "total-conv",
          "type": "stat-card",
          "title": "Total Conversations",
          "order": 1,
          "config": {
            "icon": "chat",
            "color": "violet",
            "value": "24",
            "change": "+12%"
          }
        }
      ]
    }
  ]
}
```

### How to demo the config-driven behavior

1. Open MongoDB Atlas → Browse Collections → `DashboardConfig`
2. Find the document for the project you want to change
3. Edit any of the following and save:
   - **Add a new widget** to a section's `widgets` array
   - **Change `layout`** from `"grid"` to `"list"` (changes widget layout)
   - **Change a widget's `title`** or `config.value`
   - **Add a new section** with any widgets you like
   - **Change `config.color`** on a stat-card (violet/blue/green/orange/pink)
   - **Add an `info-banner` widget** with a custom `config.message`
4. Go back to the admin dashboard page and either wait 30 seconds (auto-refresh) or click "Refresh"
5. The dashboard updates immediately — no code change, no redeploy needed

### Supported widget types

| Type | Description |
|------|-------------|
| `stat-card` | Metric card with icon, value, and optional change % |
| `integration-status` | Shows enabled/disabled status of an integration |
| `activity-feed` | List of recent activity items |
| `info-banner` | Highlighted message (info/warning/success variants) |

---

## Integrations (Simulation)

Two integrations are implemented as simulations with mock data:

**Shopify-style integration:**
- Simulates e-commerce data: orders, products, revenue, inventory
- When enabled, Gemini receives the mock Shopify store data as context
- The AI can then answer questions like "What's my best selling product?" or "Any stock alerts?"

**CRM-style integration:**
- Simulates CRM data: deals, contacts, pipeline, win rates
- When enabled, AI receives CRM context and can discuss deals and follow-ups

Toggling integrations is done from the Admin Dashboard. Changes take effect immediately in new AI conversations.

---

## Authentication

Using a simplified cookie-based session for demo purposes (as allowed by the assignment):

- Passwords are base64-encoded with a salt (not production bcrypt — intentionally simplified)
- Session is stored as a `debales_session` httpOnly cookie containing the userId
- All server-side authorization checks use `getSessionUser()` from the cookie
- Non-admins who try to access `/admin` routes get a 403 response
- Non-members who try to access project data get a 403 response

---

## Deployment (Vercel)

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI` — use the `mongodb+srv://` format (Vercel has no DNS restrictions)
   - `GEMINI_API_KEY`
4. Deploy

> **Important for Vercel:** Use the SRV connection string (`mongodb+srv://...`) in Vercel's env vars. The standard format was only needed for local dev on restricted networks. Also add `0.0.0.0/0` to MongoDB Atlas Network Access.

---

## What's Mocked vs Real

| Feature | Status |
|---------|--------|
| Gemini AI responses | ✅ Real API (free tier) |
| Shopify integration | 🟡 Simulated — mock data injected into AI context |
| CRM integration | 🟡 Simulated — mock data injected into AI context |
| Authentication | 🟡 Simplified — cookie session, no JWT, no OAuth |
| Stat card values | 🟡 Static values stored in MongoDB config |

---

## Assumptions

1. "Full auth not required" — using a cookie/session stub as permitted by the assignment
2. Integration simulation uses hardcoded mock data injected into the AI system prompt when enabled
3. The config-driven requirement applies only to the admin dashboard, not the main chat UI (as stated in the assignment)
4. Dashboard stat values (like "Total Conversations: 24") are stored in the MongoDB config — they're illustrative, not computed live. This is documented intentionally.
5. The `DashboardConfig` document's `layout` field controls the CSS grid vs list layout of widgets

---

## Evaluation Checklist

| Requirement | Implementation |
|-------------|----------------|
| Multi-tenant model | ✅ Project → members → scoped conversations |
| Admin route protection | ✅ `canAccessAdminDashboard()` in access layer + server check |
| Layered API | ✅ Access → Services → Routes → Hooks → UI |
| Zod validation | ✅ All inputs validated via schemas in `validations/index.ts` |
| TanStack Query | ✅ All server state in `src/hooks/` |
| Config-driven dashboard | ✅ `DashboardConfig` collection drives UI, editable from Atlas |
| Real AI API | ✅ Gemini 1.5 Flash with rate limit handling |
| Integration toggles | ✅ Shopify + CRM, stored in MongoDB, affect AI behavior |
| data-testid attributes | ✅ On all major regions |
