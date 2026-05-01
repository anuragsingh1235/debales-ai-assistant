'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface Props {
  onSend: (content: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function MessageInput({ onSend, isLoading, disabled }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  return (
    <div
      data-testid="message-input-area"
      className="px-6 py-4 border-t border-white/10 bg-[#0a0a0f]/80 backdrop-blur-sm"
    >
      <div className="flex gap-3 items-end max-w-4xl mx-auto">
        <div className="flex-1 bg-[#1a1a2e] border border-white/10 rounded-2xl flex items-end gap-2 px-4 py-3 focus-within:border-violet-500/50 transition-colors">
          <textarea
            ref={textareaRef}
            data-testid="message-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            rows={1}
            placeholder="Type your message... (Enter to send, Shift+Enter for newline)"
            className="flex-1 bg-transparent text-white text-sm placeholder-white/30 resize-none outline-none leading-relaxed"
            disabled={isLoading || disabled}
          />
        </div>
        <button
          data-testid="send-btn"
          onClick={handleSend}
          disabled={!value.trim() || isLoading || disabled}
          className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0"
        >
          {isLoading ? (
            <Loader2 size={16} className="text-white animate-spin" />
          ) : (
            <Send size={16} className="text-white" />
          )}
        </button>
      </div>
      <p className="text-[10px] text-white/20 text-center mt-2">
        AI responses may not always be accurate. Verify critical information.
      </p>
    </div>
  );
}
