'use client'

import { useState, useEffect } from 'react'
import type { ChatSession, ChatMessage } from '@/types/chat'
import { getMessages, sendMessage } from '@/lib/chat-api'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { ModelSelector } from './ModelSelector'
import { TokenUsagePopover } from './TokenUsagePopover'
import { updateSession } from '@/lib/chat-api'
import toast from 'react-hot-toast'
import { useContextGathering } from '@/lib/hooks/useContextGathering'
import { ContextGatheringProgress } from './ContextGatheringProgress'

interface ChatInterfaceProps {
  session: ChatSession
  onSessionUpdate: () => void
  onParentUpdate?: () => void
  onNewChat?: () => void
  isExpanded?: boolean
}

export function ChatInterface({ session, onSessionUpdate, onParentUpdate, onNewChat, isExpanded }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [streaming, setStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [selectedModel, setSelectedModel] = useState(session.selected_model)
  
  // Progressive context gathering
  const { contextState, loading: contextLoading, resetContext, refresh: refreshContext } = useContextGathering(session.id)

  // Load messages immediately on mount and when session changes
  useEffect(() => {
    // Start loading messages in background without blocking UI
    loadMessages()
  }, [session.id])

  useEffect(() => {
    setSelectedModel(session.selected_model)
  }, [session.selected_model])

  async function loadMessages() {
    try {
      // Don't show loading spinner for initial load - show empty state instead
      const isInitialLoad = messages.length === 0
      if (!isInitialLoad) {
        setLoading(true)
      }
      
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
      
      // Refresh context state after message
      refreshContext()
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

  // Calculate token stats
  const totalTokensInput = messages.reduce((sum, msg) => sum + (msg.tokens_input || 0), 0)
  const totalTokensOutput = messages.reduce((sum, msg) => sum + (msg.tokens_output || 0), 0)
  const totalCost = messages.reduce((sum, msg) => sum + (parseFloat(msg.cost_usd as any) || 0), 0)
  const totalCredits = Math.ceil(totalCost * 1000)

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Context Gathering Progress Indicator */}
      {contextState.isGathering && !contextLoading && (
        <div className="px-6 pt-4">
          <ContextGatheringProgress
            progress={contextState.progress}
            collectedInfo={contextState.collectedInfo}
            questionsAsked={contextState.questionsAsked}
            questionsAnswered={contextState.questionsAnswered}
            confidenceScore={contextState.confidenceScore}
            onDismiss={resetContext}
          />
        </div>
      )}

      <MessageList
        messages={messages}
        loading={loading}
        streamingContent={streamingContent}
        streaming={streaming}
      />

      {/* Bottom Bar - Redesigned */}
      <div className="border-t border-[#f3f4f6] bg-white">
        {/* Input Area */}
        <div className="px-6 py-4">
          <div className={`mx-auto ${isExpanded ? 'max-w-6xl' : 'max-w-4xl'}`}>
            <MessageInput
              onSend={handleSend}
              disabled={streaming}
              placeholder={
                contextState.isGathering
                  ? 'Answer to help find the perfect resource...'
                  : streaming
                  ? 'AI is responding...'
                  : 'Type your message...'
              }
            />
          </div>
        </div>

        {/* Compact Info Bar - Model Selector (left) + Token Stats (right) */}
        <div className="px-6 pb-3 bg-[#fafbfc]">
          <div className={`mx-auto flex items-center justify-between text-xs ${isExpanded ? 'max-w-6xl' : 'max-w-4xl'}`}>
            {/* Left: Model Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#9ca3af]">Model:</span>
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={handleModelChange}
                disabled={streaming}
              />
            </div>

            {/* Right: Token Stats */}
            {messages.length > 0 && (
              <div className="flex items-center gap-2 text-[10px] text-[#6b7280]">
                <span>{(totalTokensInput + totalTokensOutput).toLocaleString()} tokens</span>
                <span className="text-[#d1d5db]">·</span>
                <span className="text-[#059669] font-medium">${totalCost.toFixed(4)}</span>
                <TokenUsagePopover sessionId={session.id} totalCredits={totalCredits} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
