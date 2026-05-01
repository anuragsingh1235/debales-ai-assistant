import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IConversation, IMessage } from '@/types';

interface ConversationData {
  conversation: IConversation;
  messages: IMessage[];
}

async function fetchConversation(slug: string, conversationId: string): Promise<ConversationData> {
  const res = await fetch(`/api/projects/${slug}/conversations/${conversationId}`);
  if (!res.ok) throw new Error('Failed to load conversation');
  return res.json();
}

async function sendMessage(
  slug: string,
  conversationId: string,
  content: string
): Promise<{ userMessage: IMessage; assistantMessage: IMessage }> {
  const res = await fetch(`/api/projects/${slug}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export function useMessages(slug: string, conversationId: string) {
  return useQuery({
    queryKey: ['messages', slug, conversationId],
    queryFn: () => fetchConversation(slug, conversationId),
    enabled: !!slug && !!conversationId,
  });
}

export function useSendMessage(slug: string, conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => sendMessage(slug, conversationId, content),
    onSuccess: (data) => {
      // Update messages cache immediately
      queryClient.setQueryData<ConversationData>(['messages', slug, conversationId], (old) => {
        if (!old) return old;
        return {
          ...old,
          messages: [...old.messages, data.userMessage, data.assistantMessage],
        };
      });
      // Also refresh conversation list (title may have updated)
      queryClient.invalidateQueries({ queryKey: ['conversations', slug] });
    },
  });
}
