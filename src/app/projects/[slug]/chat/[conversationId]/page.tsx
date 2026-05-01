'use client';

import React, { use } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useConversations';
import { useProject } from '@/hooks/useProject';
import { useMessages, useSendMessage } from '@/hooks/useMessages';
import { useIntegrations } from '@/hooks/useIntegrations';
import ChatSidebar from '@/components/chat/ChatSidebar';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, AlertCircle, ShoppingBag, Database } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string; conversationId: string }>;
}

export default function ConversationPage({ params }: Props) {
  const { slug, conversationId } = use(params);

  const router = useRouter();
  const { data: authData, isLoading: authLoading, error: authError } = useAuth();
  const { data: projectData } = useProject(slug);
  const { data: convsData } = useConversations(slug);
  const { data: msgData, isLoading: msgLoading, error: msgError } = useMessages(slug, conversationId);
  const { data: integData } = useIntegrations(slug);
  const sendMessage = useSendMessage(slug, conversationId);

  useEffect(() => {
    if (!authLoading && authError) router.push('/login');
  }, [authLoading, authError, router]);

  const project = projectData?.project;
  const conversations = convsData?.conversations ?? [];
  const messages = msgData?.messages ?? [];
  const integrations = integData?.integrations;
  const productInstanceId = String((integData?.instance as { _id?: string })?._id ?? '');

  const isAdmin =
    project?.members.find((m) => m.userId === authData?.user?._id)?.role === 'admin';

  if (authLoading || msgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-violet-400" />
      </div>
    );
  }

  if (msgError) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-2 text-red-400 text-sm">
        <AlertCircle size={16} />
        Failed to load conversation
      </div>
    );
  }

  return (
    <div data-testid="conversation-page" className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      <ChatSidebar
        slug={slug}
        conversations={conversations}
        activeConversationId={conversationId}
        productInstanceId={productInstanceId}
        projectName={project?.name ?? ''}
        isAdmin={isAdmin ?? false}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-sm">
          <div>
            <h1 className="text-sm font-medium text-white truncate">
              {msgData?.conversation?.title ?? 'Conversation'}
            </h1>
            <p className="text-[10px] text-white/30 mt-0.5">{project?.name}</p>
          </div>
          {/* Integration badges */}
          <div className="flex items-center gap-2">
            {integrations?.shopify?.enabled && (
              <span
                data-testid="shopify-badge"
                className="flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full"
              >
                <ShoppingBag size={10} /> Shopify
              </span>
            )}
            {integrations?.crm?.enabled && (
              <span
                data-testid="crm-badge"
                className="flex items-center gap-1 text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-full"
              >
                <Database size={10} /> CRM
              </span>
            )}
          </div>
        </header>

        <MessageList messages={messages} isLoading={sendMessage.isPending} />

        <MessageInput
          onSend={(content) => sendMessage.mutate(content)}
          isLoading={sendMessage.isPending}
        />
      </div>
    </div>
  );
}
