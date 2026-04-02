'use client'

import { useState, useEffect } from 'react'
import type { ChatSession, ChatMessage } from '@/types/chat'
import { getMessages, sendMessage } from '@/lib/chat-api'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { ModelSelector } from './ModelSelector'
import { updateSession } from '@/lib/chat-api'
import toast from 'react-hot-toast'
import { Zap } from 'lucide-react'

interface ChatInterfaceProps {
  session: ChatSession
  onSessionUpdate: () => void
  onParentUpdate?: () => void
}

export function ChatInterface({ session, onSessionUpdate, onParentUpdate }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [streaming, setStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [selectedModel, setSelectedModel] = useState(session.selected_model)

  // Load messages immediately on mount and when session changes
  useEffect(() => {
    loadMessages()
  }, [session.id])

  useEffect(() => {
    setSelectedModel(session.selected_model)
  }, [session.selected_model])

  async function loadMessages() {
    try {
      setLoading(true)
      const data = await getMessages(session.id)
      setMessages(data)
    } catch (error) {
      console.error('Failed to load messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  async function handleSend(content: string) {
    if (!content.trim() || streaming) return

    const userMessage: ChatMessage = {
      id: 'temp-' + Date.now(),
      session_id: session.id,
      role: 'user',
      content,
      model_used: null,
      tokens_input: null,
      tokens_output: null,
      cost_usd: null,
      metadata: {},
      created_at: new Date().toISOString(),
    }

    try {
      setStreaming(true)
      setStreamingContent('')

      // Check if this is the first message in the session
      const isFirstMessage = messages.length === 0

      // Add user message optimistically
      setMessages(prev => [...prev, userMessage])

      // If this is the first message, auto-generate title from first 8 words
      if (isFirstMessage && session.title === 'New Conversation') {
        const words = content.trim().split(/\s+/)
        const titleWords = words.slice(0, 8)
        const autoTitle = titleWords.join(' ') + (words.length > 8 ? '...' : '')
        
        // Update title without triggering session reload
        try {
          await updateSession(session.id, { title: autoTitle })
          // Only notify parent to update sidebar, don't reload current session
          onParentUpdate?.()
        } catch (error) {
          console.error('Failed to auto-update title:', error)
        }
      }

      // Stream AI response
      let streamedContent = ''
      for await (const chunk of sendMessage({
        sessionId: session.id,
        message: content,
        model: selectedModel,
      })) {
        streamedContent += chunk
        setStreamingContent(streamedContent)
      }

      // After streaming completes, reload messages to get the saved version with metadata
      await loadMessages()
      setStreamingContent('')
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
      // Remove optimistic user message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id))
    } finally {
      setStreaming(false)
    }
  }

  async function handleModelChange(model: string) {
    try {
      await updateSession(session.id, { selected_model: model })
      setSelectedModel(model)
      onSessionUpdate()
      toast.success('Model updated')
    } catch (error) {
      console.error('Failed to update model:', error)
      toast.error('Failed to update model')
    }
  }

  // Calculate total credits used in this conversation
  const totalCredits = messages.reduce((sum, msg) => {
    if (msg.role === 'assistant' && msg.cost_usd) {
      const credits = Math.ceil(msg.cost_usd * 1000)
      return sum + credits
    }
    return sum
  }, 0)

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <header className="border-b border-[#e8eff3] px-5 py-3 bg-white">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <h1 className="text-xs font-bold text-[#191c1e] truncate tracking-tight">
              {session.title}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-[#464554]">
              <span className="px-1.5 py-0.5 bg-[#f2f4f6] rounded font-semibold text-[10px]">
                {messages.length}
              </span>
              {totalCredits > 0 && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-br from-[#4f46e5]/10 to-[#6366f1]/10 rounded">
                  <Zap className="h-3 w-3 text-[#4f46e5]" />
                  <span className="text-[10px] font-bold text-[#4f46e5]">{totalCredits}</span>
                </div>
              )}
            </div>
          </div>
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
            disabled={streaming}
          />
        </div>
      </header>

      <MessageList
        messages={messages}
        loading={loading}
        streamingContent={streamingContent}
        streaming={streaming}
      />

      <MessageInput
        onSend={handleSend}
        disabled={streaming}
        placeholder={streaming ? 'AI is responding...' : 'Ask anything...'}
      />
    </div>
  )
}
