import { useQuery } from '@tanstack/react-query';
import { IDashboardConfig } from '@/types';

async function fetchDashboard(slug: string): Promise<{ config: IDashboardConfig }> {
  const res = await fetch(`/api/projects/${slug}/admin/dashboard`);
  if (!res.ok) throw new Error('Failed to load dashboard config');
  return res.json();
}

export function useDashboard(slug: string) {
  return useQuery({
    queryKey: ['dashboard', slug],
    queryFn: () => fetchDashboard(slug),
    enabled: !!slug,
    // refetch every 30s so config changes in MongoDB are visible quickly
    refetchInterval: 30_000,
  });
}
