'use client';

import { useAuth } from '@/hooks/useAuth';
import { useConversations, useCreateConversation } from '@/hooks/useConversations';
import { useProject } from '@/hooks/useProject';
import { useIntegrations } from '@/hooks/useIntegrations';
import ChatSidebar from '@/components/chat/ChatSidebar';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function ChatLandingPage({ params }: Props) {
  const [slug, setSlug] = React.useState('');

  React.useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  const router = useRouter();
  const { data: authData, isLoading: authLoading, error: authError } = useAuth();
  const { data: projectData } = useProject(slug);
  const { data: convsData, isLoading: convsLoading } = useConversations(slug);
  const { data: integData } = useIntegrations(slug);
  const createConv = useCreateConversation(slug);

  useEffect(() => {
    if (!authLoading && authError) router.push('/login');
  }, [authLoading, authError, router]);

  const project = projectData?.project;
  const conversations = convsData?.conversations ?? [];
  const productInstanceId = String((integData?.instance as { _id?: string })?._id ?? '');

  const isAdmin =
    project?.members.find((m) => m.userId === authData?.user?._id)?.role === 'admin';

  if (authLoading || convsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div data-testid="chat-shell" className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      <ChatSidebar
        slug={slug}
        conversations={conversations}
        productInstanceId={productInstanceId}
        projectName={project?.name ?? ''}
        isAdmin={isAdmin ?? false}
      />
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center px-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✨</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {project?.name ?? 'AI Assistant'}
          </h2>
          <p className="text-white/40 text-sm mb-6 max-w-sm">
            Start a new conversation or pick one from the sidebar
          </p>
          <button
            onClick={async () => {
              const result = await createConv.mutateAsync(productInstanceId);
              router.push(`/projects/${slug}/chat/${result.conversation._id}`);
            }}
            disabled={createConv.isPending || !productInstanceId}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2 mx-auto"
          >
            {createConv.isPending ? <Loader2 size={14} className="animate-spin" /> : '+ '}
            New Conversation
          </button>
        </div>
      </main>
    </div>
  );
}

// Need to import React for useState in this file
import React from 'react';
