import { useQuery } from '@tanstack/react-query';
import { IUser } from '@/types';

async function fetchMe(): Promise<{ user: IUser }> {
  const res = await fetch('/api/auth/me');
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}

export function useAuth() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
