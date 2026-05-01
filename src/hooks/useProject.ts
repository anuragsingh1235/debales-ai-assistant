import { useQuery } from '@tanstack/react-query';
import { IProject } from '@/types';

async function fetchProjects(): Promise<{ projects: IProject[] }> {
  const res = await fetch('/api/projects');
  if (!res.ok) throw new Error('Failed to load projects');
  return res.json();
}

async function fetchProject(slug: string): Promise<{ project: IProject }> {
  const res = await fetch(`/api/projects/${slug}`);
  if (!res.ok) throw new Error('Failed to load project');
  return res.json();
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: ['project', slug],
    queryFn: () => fetchProject(slug),
    enabled: !!slug,
  });
}
