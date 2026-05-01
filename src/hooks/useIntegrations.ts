import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IIntegrations } from '@/types';

interface IntegrationsData {
  integrations: IIntegrations | null;
  instance: unknown;
}

async function fetchIntegrations(slug: string): Promise<IntegrationsData> {
  const res = await fetch(`/api/projects/${slug}/integrations`);
  if (!res.ok) throw new Error('Failed to load integrations');
  return res.json();
}

async function updateIntegrations(slug: string, integrations: IIntegrations): Promise<IntegrationsData> {
  const res = await fetch(`/api/projects/${slug}/integrations`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(integrations),
  });
  if (!res.ok) throw new Error('Failed to update integrations');
  return res.json();
}

export function useIntegrations(slug: string) {
  return useQuery({
    queryKey: ['integrations', slug],
    queryFn: () => fetchIntegrations(slug),
    enabled: !!slug,
  });
}

export function useUpdateIntegrations(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (integrations: IIntegrations) => updateIntegrations(slug, integrations),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', slug] });
    },
  });
}
