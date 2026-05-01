'use client';

import { IDashboardConfig, IDashboardSection, IDashboardWidget } from '@/types';
import { MessageSquare, Users, Zap, Activity, ShoppingBag, Database, Info } from 'lucide-react';

// Widget renderers - each one handles a type from the config
// Adding/removing widgets in MongoDB changes what appears here

function StatCard({ widget }: { widget: IDashboardWidget }) {
  const iconMap: Record<string, React.ReactNode> = {
    chat: <MessageSquare size={18} />,
    users: <Users size={18} />,
    zap: <Zap size={18} />,
    activity: <Activity size={18} />,
    shopify: <ShoppingBag size={18} />,
    database: <Database size={18} />,
  };

  const colorMap: Record<string, string> = {
    violet: 'from-violet-500/20 to-violet-600/10 border-violet-500/20 text-violet-400',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400',
    green: 'from-green-500/20 to-green-600/10 border-green-500/20 text-green-400',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/20 text-orange-400',
    pink: 'from-pink-500/20 to-pink-600/10 border-pink-500/20 text-pink-400',
  };

  const color = String(widget.config.color || 'violet');
  const icon = String(widget.config.icon || 'activity');
  const value = String(widget.config.value || '—');
  const change = widget.config.change ? String(widget.config.change) : null;

  return (
    <div
      data-testid={`widget-stat-${widget.id}`}
      className={`p-5 rounded-xl border bg-gradient-to-br ${colorMap[color] || colorMap.violet}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="opacity-80">{iconMap[icon] || <Activity size={18} />}</span>
        {change && (
          <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-white/50">{widget.title}</div>
    </div>
  );
}

function IntegrationStatus({ widget }: { widget: IDashboardWidget }) {
  const integration = String(widget.config.integration || '');
  const enabled = Boolean(widget.config.enabled);

  return (
    <div
      data-testid={`widget-integration-${widget.id}`}
      className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between"
    >
      <div>
        <p className="text-sm font-medium text-white">{widget.title}</p>
        <p className="text-xs text-white/40 mt-0.5">{integration} integration</p>
      </div>
      <div
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          enabled
            ? 'bg-green-500/20 text-green-400 border border-green-500/20'
            : 'bg-white/5 text-white/30 border border-white/10'
        }`}
      >
        {enabled ? 'Active' : 'Disabled'}
      </div>
    </div>
  );
}

function ActivityFeed({ widget }: { widget: IDashboardWidget }) {
  const items = (widget.config.items as Array<{ text: string; time: string }>) || [
    { text: 'New conversation started', time: '2m ago' },
    { text: 'Shopify integration queried', time: '5m ago' },
    { text: 'User asked about orders', time: '12m ago' },
    { text: 'CRM data synced', time: '1h ago' },
  ];

  return (
    <div
      data-testid={`widget-activity-${widget.id}`}
      className="p-5 rounded-xl border border-white/10 bg-white/5"
    >
      <h4 className="text-sm font-medium text-white mb-3">{widget.title}</h4>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/70">{item.text}</p>
              <p className="text-[10px] text-white/30 mt-0.5">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoBanner({ widget }: { widget: IDashboardWidget }) {
  const message = String(widget.config.message || widget.title);
  const variant = String(widget.config.variant || 'info');

  const variantStyles: Record<string, string> = {
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300',
    success: 'bg-green-500/10 border-green-500/20 text-green-300',
  };

  return (
    <div
      data-testid={`widget-banner-${widget.id}`}
      className={`p-4 rounded-xl border flex items-start gap-3 ${variantStyles[variant] || variantStyles.info}`}
    >
      <Info size={16} className="flex-shrink-0 mt-0.5" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

// Widget dispatcher - maps config type to component
function WidgetRenderer({ widget }: { widget: IDashboardWidget }) {
  switch (widget.type) {
    case 'stat-card':
      return <StatCard widget={widget} />;
    case 'integration-status':
      return <IntegrationStatus widget={widget} />;
    case 'activity-feed':
      return <ActivityFeed widget={widget} />;
    case 'info-banner':
      return <InfoBanner widget={widget} />;
    default:
      return (
        <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-white/40 text-sm">
          Unknown widget type: {widget.type}
        </div>
      );
  }
}

function DashboardSection({ section, layout }: { section: IDashboardSection; layout: 'grid' | 'list' }) {
  const sortedWidgets = [...section.widgets].sort((a, b) => a.order - b.order);

  return (
    <div data-testid={`section-${section.id}`} className="mb-8">
      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
        {section.title}
      </h3>
      <div
        className={
          layout === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'flex flex-col gap-3'
        }
      >
        {sortedWidgets.map((widget) => (
          <WidgetRenderer key={widget.id} widget={widget} />
        ))}
      </div>
    </div>
  );
}

interface Props {
  config: IDashboardConfig;
}

export default function ConfigDrivenDashboard({ config }: Props) {
  const sortedSections = [...config.sections].sort((a, b) => a.order - b.order);

  return (
    <div data-testid="config-driven-dashboard">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">{config.title}</h2>
        <p className="text-sm text-white/40 mt-1">
          Dashboard layout loaded from MongoDB · last synced just now
        </p>
      </div>
      {sortedSections.map((section) => (
        <DashboardSection key={section.id} section={section} layout={config.layout} />
      ))}
    </div>
  );
}
