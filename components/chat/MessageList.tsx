'use client'

import { useEffect, useRef } from 'react'
import type { ChatMessage } from '@/types/chat'
import { User, Bot, Loader2, Sparkles } from 'lucide-react'
import { MessageContent } from './MessageContent'

interface MessageListProps {
  messages: ChatMessage[]
  loading: boolean
  streamingContent: string
  streaming: boolean
}

export function MessageList({ messages, loading, streamingContent, streaming }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#ffffff]">
        <div className="text-center">
          <div className="relative w-8 h-8 mx-auto mb-2">
            <div className="absolute inset-0 rounded-full border-2 border-[#f3f4f6]" />
            <div className="absolute inset-0 rounded-full border-2 border-[#4f46e5] border-t-transparent animate-spin" />
          </div>
          <p className="text-xs text-[#6b7280]">Loading...</p>
        </div>
      </div>
    )
  }

  if (messages.length === 0 && !streaming) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#ffffff] p-6">
        <div className="text-center max-w-xs">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#f9fafb] flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-[#9ca3af]" />
          </div>
          <p className="text-xs text-[#6b7280]">
            How can I help you today?
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#ffffff]">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
        >
          {/* Avatar */}
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
            message.role === 'assistant' 
              ? 'bg-[#4f46e5]' 
              : 'bg-[#f3f4f6]'
          }`}>
            {message.role === 'assistant' ? (
              <Bot className="w-4 h-4 text-white" />
            ) : (
              <User className="w-4 h-4 text-[#6b7280]" />
            )}
          </div>
          
          {/* Message Content */}
          <div className={`flex-1 max-w-[85%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div
              className={`inline-block text-left rounded-lg px-3 py-2 text-sm ${
                message.role === 'user'
                  ? 'bg-[#4f46e5] text-white'
                  : 'bg-[#f9fafb] text-[#111827] border border-[#e5e7eb]'
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
            
            {/* Credits Info */}
            {message.role === 'assistant' && message.cost_usd && (
              <div className="mt-1.5 flex items-center gap-2 text-[10px] text-[#9ca3af]">
                <div className="flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5 text-[#4f46e5]" />
                  <span className="font-semibold text-[#4f46e5]">{Math.ceil(message.cost_usd * 1000)}</span>
                </div>
                <span>•</span>
                <span>{message.tokens_input}↑</span>
                <span>{message.tokens_output}↓</span>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Streaming Message */}
      {streaming && streamingContent && (
        <div className="flex gap-3 flex-row">
          <div className="w-7 h-7 rounded-lg bg-[#4f46e5] flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 max-w-[85%]">
            <div className="inline-block rounded-lg px-3 py-2 bg-[#f9fafb] text-[#111827] border border-[#e5e7eb] text-sm">
              <MessageContent content={streamingContent} />
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[#6b7280]">
              <Loader2 className="w-2.5 h-2.5 animate-spin text-[#4f46e5]" />
              <span>Generating...</span>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
