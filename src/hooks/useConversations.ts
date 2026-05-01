import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IConversation } from '@/types';

async function fetchConversations(slug: string): Promise<{ conversations: IConversation[] }> {
  const res = await fetch(`/api/projects/${slug}/conversations`);
  if (!res.ok) throw new Error('Failed to load conversations');
  return res.json();
}

async function createConversation(
  slug: string,
  productInstanceId: string
): Promise<{ conversation: IConversation }> {
  const res = await fetch(`/api/projects/${slug}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productInstanceId, title: 'New Conversation' }),
  });
  if (!res.ok) throw new Error('Failed to create conversation');
  return res.json();
}

export function useConversations(slug: string) {
  return useQuery({
    queryKey: ['conversations', slug],
    queryFn: () => fetchConversations(slug),
    enabled: !!slug,
  });
}

export function useCreateConversation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productInstanceId: string) => createConversation(slug, productInstanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', slug] });
    },
  });
}
