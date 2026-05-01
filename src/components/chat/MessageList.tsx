'use client';

import { IMessage } from '@/types';
import { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';

interface Props {
  messages: IMessage[];
  isLoading?: boolean;
}

function StepIndicator({ steps }: { steps: string[] }) {
  if (!steps || steps.length === 0) return null;
  return (
    <div className="mb-2 space-y-1">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs text-white/30">
          <span className="w-1 h-1 rounded-full bg-violet-500/60" />
          {step}
        </div>
      ))}
    </div>
  );
}

function MessageBubble({ message }: { message: IMessage }) {
  const isUser = message.role === 'user';

  return (
    <div
      data-testid={`message-${message._id}`}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
          isUser ? 'bg-violet-600' : 'bg-[#1a1a2e] border border-white/10'
        }`}
      >
        {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-violet-400" />}
      </div>

      {/* Content */}
      <div className={`max-w-[70%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isUser && <StepIndicator steps={message.steps || []} />}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-violet-600 text-white rounded-tr-sm'
              : 'bg-[#1a1a2e] border border-white/10 text-white/90 rounded-tl-sm'
          }`}
        >
          {message.content.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < message.content.split('\n').length - 1 && <br />}
            </span>
          ))}
        </div>
        <span className="text-[10px] text-white/25 mt-1 px-1">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full flex-shrink-0 bg-[#1a1a2e] border border-white/10 flex items-center justify-center">
        <Bot size={14} className="text-violet-400" />
      </div>
      <div className="bg-[#1a1a2e] border border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-violet-400/60 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MessageList({ messages, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div
        data-testid="empty-messages"
        className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center">
          <Bot size={28} className="text-violet-400" />
        </div>
        <div>
          <h3 className="text-white font-medium mb-1">How can I help you today?</h3>
          <p className="text-sm text-white/40">
            Ask me anything — I&apos;m connected to your integrations and ready to help.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="message-list" className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
      {messages.map((msg) => (
        <MessageBubble key={msg._id} message={msg} />
      ))}
      {isLoading && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
