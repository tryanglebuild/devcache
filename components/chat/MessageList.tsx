'use client'

import { useEffect, useRef, memo, forwardRef } from 'react'
import type { ChatMessage, ThinkingStep } from '@/types/chat'
import { User, Bot, Loader2, Sparkles, ChevronUp } from 'lucide-react'
import { MessageContent } from './MessageContent'
import { ThinkingProcess } from './ThinkingProcess'

interface MessageListProps {
  messages: ChatMessage[]
  loading: boolean
  streamingContent: string
  streaming: boolean
  streamingThinking?: ThinkingStep[]
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
}

export const MessageList = memo(forwardRef<HTMLDivElement, MessageListProps>(function MessageList(
  {
    messages,
    loading,
    streamingContent,
    streaming,
    streamingThinking = [],
    hasMore = false,
    loadingMore = false,
    onLoadMore,
  },
  ref
) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom whenever new messages arrive or streaming content updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-white dark:bg-surface-container">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`flex gap-4 ${i % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-9 h-9 rounded-xl flex-shrink-0 animate-pulse ${
              i % 2 === 0 ? 'bg-[#e5e7eb] dark:bg-white/[0.09]' : 'bg-[#ddd6fe] dark:bg-[#7c7ff5]/20'
            }`} />
            <div className={`flex-1 max-w-[75%] ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block rounded-2xl h-20 animate-pulse ${
                i % 2 === 0 ? 'bg-[#e5e7eb] dark:bg-white/[0.09] w-56' : 'bg-[#f3f4f6] dark:bg-surface-container-high w-72'
              }`} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (messages.length === 0 && !streaming) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-surface-container p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#eef2ff] to-[#e0e7ff] dark:from-[#7c7ff5]/10 dark:to-[#7c7ff5]/10 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-[#4f46e5] dark:text-[#7c7ff5]" />
          </div>
          <h3 className="text-lg font-bold text-[#111827] dark:text-on-surface mb-2">
            Start a conversation
          </h3>
          <p className="text-sm text-[#6b7280] dark:text-on-surface-variant">
            Ask me anything about your projects, templates, or get help with development tasks.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-white dark:bg-surface-container"
    >
      {/* Load More Messages button */}
      {hasMore && !loadingMore && (
        <div className="flex justify-center py-2">
          <button
            onClick={onLoadMore}
            className="flex items-center gap-2 text-xs px-4 py-2 bg-[#f3f4f6] dark:bg-surface-container-high text-[#4f46e5] dark:text-[#7c7ff5] font-semibold rounded-full border border-[#e5e7eb] dark:border-white/[0.06] hover:bg-[#eef2ff] dark:hover:bg-[#7c7ff5]/10 transition-colors"
          >
            <ChevronUp className="w-3 h-3" />
            Load More Messages
          </button>
        </div>
      )}

      {/* Loading older messages indicator */}
      {loadingMore && (
        <div className="flex justify-center py-2">
          <div className="flex items-center gap-2 text-xs text-[#6b7280] dark:text-on-surface-variant px-3 py-1.5 bg-[#f3f4f6] dark:bg-surface-container-high rounded-full">
            <Loader2 className="w-3 h-3 animate-spin" />
            Loading older messages...
          </div>
        </div>
      )}

      {/* Beginning of conversation indicator */}
      {!hasMore && messages.length > 0 && !loadingMore && (
        <div className="flex justify-center py-1">
          <span className="text-[10px] text-[#9ca3af] dark:text-on-surface-variant px-3 py-1 bg-[#f9fafb] dark:bg-surface-container-high rounded-full border border-[#e5e7eb] dark:border-white/[0.06]">
            Beginning of conversation
          </span>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
        >
          {/* Avatar */}
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
            message.role === 'assistant'
              ? 'bg-gradient-to-br from-[#4f46e5] to-[#6366f1]'
              : 'bg-gradient-to-br from-[#f3f4f6] to-[#e5e7eb] dark:from-surface-container-high dark:to-surface-container-high'
          }`}>
            {message.role === 'assistant' ? (
              <Bot className="w-5 h-5 text-white" />
            ) : (
              <User className="w-5 h-5 text-[#6b7280] dark:text-on-surface-variant" />
            )}
          </div>

          {/* Message Content */}
          <div className={`flex-1 max-w-[75%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            {/* Show thinking process for assistant messages */}
            {message.role === 'assistant' && message.thinking && message.thinking.length > 0 && (
              <div className="mb-3">
                <ThinkingProcess steps={message.thinking} isComplete={true} />
              </div>
            )}

            <div
              className={`inline-block text-left rounded-2xl px-4 py-3 text-sm shadow-sm ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white'
                  : 'bg-white dark:bg-surface-container text-[#111827] dark:text-on-surface border border-[#e5e7eb] dark:border-white/[0.09]'
              }`}
            >
              {message.role === 'assistant' ? (
                <MessageContent
                  content={message.content}
                  templateMetadata={message.metadata?.templates}
                />
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              )}
            </div>

            {/* Token Info */}
            {message.role === 'assistant' && (message.tokens_input || message.tokens_output) && (
              <div className="mt-2 flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-[#f3f4f6] dark:bg-surface-container-high rounded-lg">
                  <Sparkles className="h-3 w-3 text-[#4f46e5] dark:text-[#7c7ff5]" />
                  <span className="font-semibold text-[#4f46e5] dark:text-[#7c7ff5]">
                    {((message.tokens_input || 0) + (message.tokens_output || 0)).toLocaleString()}
                  </span>
                  <span className="text-[#9ca3af] dark:text-on-surface-variant">tokens</span>
                </div>
                <div className="flex items-center gap-2 text-[#6b7280] dark:text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="font-medium">↑</span>
                    {(message.tokens_input || 0).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-medium">↓</span>
                    {(message.tokens_output || 0).toLocaleString()}
                  </span>
                </div>
                {message.cost_usd && (
                  <span className="text-[#059669] font-semibold">
                    ${parseFloat(message.cost_usd as any).toFixed(6)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Streaming Message */}
      {streaming && (streamingContent || streamingThinking.length > 0) && (
        <div className="flex gap-4 flex-row">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#6366f1] flex items-center justify-center flex-shrink-0 shadow-sm">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 max-w-[75%]">
            {streamingThinking.length > 0 && (
              <div className="mb-3">
                <ThinkingProcess steps={streamingThinking} isComplete={false} />
              </div>
            )}

            {streamingContent && (
              <>
                <div className="inline-block rounded-2xl px-4 py-3 bg-white dark:bg-surface-container text-[#111827] dark:text-on-surface border border-[#e5e7eb] dark:border-white/[0.09] text-sm shadow-sm">
                  <MessageContent content={streamingContent} />
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-[#eef2ff] dark:bg-[#7c7ff5]/10 rounded-lg">
                    <Loader2 className="w-3 h-3 animate-spin text-[#4f46e5] dark:text-[#7c7ff5]" />
                    <span className="text-[#4f46e5] dark:text-[#7c7ff5] font-medium">Generating...</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}))
