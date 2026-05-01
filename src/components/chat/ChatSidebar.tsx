'use client';

import { IConversation } from '@/types';
import { useCreateConversation } from '@/hooks/useConversations';
import { useRouter } from 'next/navigation';
import { MessageSquare, Plus, Bot, LogOut } from 'lucide-react';
import Link from 'next/link';

interface Props {
  slug: string;
  conversations: IConversation[];
  activeConversationId?: string;
  productInstanceId: string;
  projectName: string;
  isAdmin: boolean;
}

export default function ChatSidebar({
  slug,
  conversations,
  activeConversationId,
  productInstanceId,
  projectName,
  isAdmin,
}: Props) {
  const router = useRouter();
  const createConversation = useCreateConversation(slug);

  const handleNewChat = async () => {
    const result = await createConversation.mutateAsync(productInstanceId);
    router.push(`/projects/${slug}/chat/${result.conversation._id}`);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <aside
      data-testid="chat-sidebar"
      className="w-64 flex-shrink-0 bg-[#0d0d14] border-r border-white/10 flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Bot size={14} className="text-white" />
          </div>
          <span className="font-semibold text-white text-sm">Debales AI</span>
        </div>
        <p className="text-xs text-white/40 truncate pl-9">{projectName}</p>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          data-testid="new-chat-btn"
          onClick={handleNewChat}
          disabled={createConversation.isPending}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Plus size={15} />
          {createConversation.isPending ? 'Creating...' : 'New Chat'}
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {conversations.length === 0 ? (
          <p className="text-xs text-white/30 text-center mt-6 px-4">
            No conversations yet. Start a new chat!
          </p>
        ) : (
          <div className="space-y-0.5">
            {conversations.map((conv) => (
              <Link
                key={conv._id}
                href={`/projects/${slug}/chat/${conv._id}`}
                data-testid={`conversation-${conv._id}`}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors group ${
                  activeConversationId === conv._id
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <MessageSquare size={13} className="flex-shrink-0" />
                <span className="truncate">{conv.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer Nav */}
      <div className="p-3 border-t border-white/10 space-y-1">
        {isAdmin && (
          <Link
            href={`/projects/${slug}/admin`}
            data-testid="admin-link"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors"
          >
            <span>⚙️</span> Admin Dashboard
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
