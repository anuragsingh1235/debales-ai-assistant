'use client';

import React, { use, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProject } from '@/hooks/useProject';
import { useDashboard } from '@/hooks/useDashboard';
import { useIntegrations, useUpdateIntegrations } from '@/hooks/useIntegrations';
import ConfigDrivenDashboard from '@/components/admin/ConfigDrivenDashboard';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  ShoppingBag,
  Database,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import Link from 'next/link';
import { IIntegrations } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function AdminDashboardPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();

  const { data: authData, isLoading: authLoading, error: authError } = useAuth();
  const { data: projectData, isLoading: projectLoading } = useProject(slug);
  const { data: dashboardData, isLoading: dashLoading, error: dashError, refetch } = useDashboard(slug);
  const { data: integData } = useIntegrations(slug);
  const updateIntegrations = useUpdateIntegrations(slug);

  const [savingInteg, setSavingInteg] = useState(false);

  useEffect(() => {
    if (!authLoading && authError) {
      router.push('/login');
    }
  }, [authLoading, authError, router]);

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading && !projectLoading && projectData?.project && authData?.user) {
      const role = projectData.project.members.find(
        (m) => m.userId === authData.user._id
      )?.role;
      if (role !== 'admin') {
        router.push(`/projects/${slug}/chat`);
      }
    }
  }, [authLoading, projectLoading, projectData, authData, router, slug]);

  const integrations = integData?.integrations;

  const handleToggleIntegration = async (key: 'shopify' | 'crm') => {
    if (!integrations) return;
    setSavingInteg(true);

    const updated: IIntegrations = {
      ...integrations,
      [key]: {
        ...integrations[key],
        enabled: !integrations[key].enabled,
      },
    };

    try {
      await updateIntegrations.mutateAsync(updated);
    } finally {
      setSavingInteg(false);
    }
  };

  if (authLoading || dashLoading || projectLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-violet-400" />
      </div>
    );
  }

  if (dashError) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-2 text-red-400 text-sm">
        <AlertCircle size={16} />
        Access denied or dashboard not found
      </div>
    );
  }

  const project = projectData?.project;

  return (
    <div data-testid="admin-dashboard-page" className="min-h-screen bg-[#0a0a0f]">
      {/* Fixed background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/8 blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href={`/projects/${slug}/chat`}
              className="text-white/40 hover:text-white/80 transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-xs text-white/40 mt-0.5">{project?.name}</p>
            </div>
          </div>

          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/80 transition-colors"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>

        {/* Integration Toggles */}
        <div className="mb-8 p-5 bg-[#111118] border border-white/10 rounded-2xl">
          <h3 className="text-sm font-semibold text-white mb-4">Integration Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
                  <ShoppingBag size={16} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Shopify</p>
                  <p className="text-[10px] text-white/35">E-commerce integration</p>
                </div>
              </div>
              <button
                data-testid="toggle-shopify"
                onClick={() => handleToggleIntegration('shopify')}
                disabled={savingInteg}
                className="text-white/50 hover:text-white transition-colors disabled:opacity-40"
              >
                {integrations?.shopify?.enabled ? (
                  <ToggleRight size={28} className="text-green-400" />
                ) : (
                  <ToggleLeft size={28} />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                  <Database size={16} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">CRM</p>
                  <p className="text-[10px] text-white/35">Customer data integration</p>
                </div>
              </div>
              <button
                data-testid="toggle-crm"
                onClick={() => handleToggleIntegration('crm')}
                disabled={savingInteg}
                className="text-white/50 hover:text-white transition-colors disabled:opacity-40"
              >
                {integrations?.crm?.enabled ? (
                  <ToggleRight size={28} className="text-green-400" />
                ) : (
                  <ToggleLeft size={28} />
                )}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-white/25 mt-3">
            Toggling integrations affects AI responses in real-time.
          </p>
        </div>

        {/* Config-driven Dashboard */}
        {dashboardData?.config ? (
          <ConfigDrivenDashboard config={dashboardData.config} />
        ) : (
          <div className="text-center py-12 text-white/30 text-sm">
            No dashboard config found for this project.
          </div>
        )}
      </div>
    </div>
  );
}
