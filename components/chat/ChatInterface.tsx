'use client'

import { useState, useEffect, useRef } from 'react'
import type { ChatSession, ChatMessage, ThinkingStep } from '@/types/chat'
import { getMessages, sendMessage } from '@/lib/chat-api'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { ModelSelector } from './ModelSelector'
import { TokenUsagePopover } from './TokenUsagePopover'
import { updateSession } from '@/lib/chat-api'
import toast from 'react-hot-toast'
import { useContextGathering } from '@/lib/hooks/useContextGathering'
import { ContextGatheringProgress } from './ContextGatheringProgress'

const PAGE_SIZE = 20

interface ChatInterfaceProps {
  session: ChatSession
  onSessionUpdate: () => void
  onParentUpdate?: () => void
  onNewChat?: () => void
  isExpanded?: boolean
  cachedMessages?: ChatMessage[]
  onCacheUpdate?: (sessionId: string, messages: ChatMessage[]) => void
}

export function ChatInterface({ session, onSessionUpdate, onParentUpdate, onNewChat, isExpanded, cachedMessages, onCacheUpdate }: ChatInterfaceProps) {
  // Seed from cache for instant display; fresh load happens in the background
  const [messages, setMessages] = useState<ChatMessage[]>(cachedMessages ?? [])
  const [loading, setLoading] = useState(!cachedMessages || cachedMessages.length === 0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [streamingThinking, setStreamingThinking] = useState<ThinkingStep[]>([])
  const [selectedModel, setSelectedModel] = useState(session.selected_model)

  // Ref forwarded to the scrollable container inside MessageList
  const listRef = useRef<HTMLDivElement>(null)

  // Progressive context gathering
  const { contextState, loading: contextLoading, resetContext, refresh: refreshContext } = useContextGathering(session.id)

  // Load messages on mount and whenever the session changes
  useEffect(() => {
    loadMessages()
  }, [session.id])

  useEffect(() => {
    setSelectedModel(session.selected_model)
  }, [session.selected_model])

  // ------------------------------------------------------------------
  // Initial load — fetches the latest PAGE_SIZE messages
  // ------------------------------------------------------------------
  async function loadMessages() {
    try {
      if (!cachedMessages || cachedMessages.length === 0) setLoading(true)

      const { messages: fresh, hasMore: more } = await getMessages(session.id, PAGE_SIZE)
      setMessages(fresh)
      setHasMore(more)
      onCacheUpdate?.(session.id, fresh)
    } catch (error) {
      console.error('Failed to load messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  // ------------------------------------------------------------------
  // Pagination — load the next (older) page using a beforeId cursor.
  // Restores scroll position after prepending so the view doesn't jump.
  // ------------------------------------------------------------------
  async function loadOlderMessages() {
    if (!hasMore || loadingMore || messages.length === 0) return

    const firstId = messages[0].id
    const container = listRef.current
    const prevScrollHeight = container?.scrollHeight ?? 0

    try {
      setLoadingMore(true)
      const { messages: older, hasMore: more } = await getMessages(session.id, PAGE_SIZE, firstId)

      setMessages(prev => {
        const updated = [...older, ...prev]
        onCacheUpdate?.(session.id, updated)
        return updated
      })
      setHasMore(more)

      // Restore scroll so the user stays at the same visual position
      if (container) {
        container.scrollTop = container.scrollHeight - prevScrollHeight
      }
    } catch (error) {
      console.error('Failed to load older messages:', error)
      toast.error('Failed to load older messages')
    } finally {
      setLoadingMore(false)
    }
  }

  // ------------------------------------------------------------------
  // Send a message — optimistic UI + targeted post-stream update
  // ------------------------------------------------------------------
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
      setStreamingThinking([])

      const isFirstMessage = messages.length === 0

      // Optimistic: show user message immediately
      setMessages(prev => [...prev, userMessage])

      // Auto-generate session title from the first message
      if (isFirstMessage && session.title === 'New Conversation') {
        const words = content.trim().split(/\s+/)
        const autoTitle = words.slice(0, 8).join(' ') + (words.length > 8 ? '...' : '')
        try {
          await updateSession(session.id, { title: autoTitle })
          onParentUpdate?.()
        } catch (error) {
          console.error('Failed to auto-update title:', error)
        }
      }

      // Stream AI response
      let streamedContent = ''
      const thinkingSteps: ThinkingStep[] = []

      for await (const chunk of sendMessage({
        sessionId: session.id,
        message: content,
        model: selectedModel,
      })) {
        if (chunk.startsWith('__THINKING__:')) {
          thinkingSteps.push(JSON.parse(chunk.substring(13)))
          setStreamingThinking([...thinkingSteps])
        } else {
          streamedContent += chunk
          setStreamingContent(streamedContent)
        }
      }

      // Targeted update: immediately append an optimistic assistant message
      // built from the stream content we already have. Then fetch only the
      // last 2 messages from the DB to swap in real IDs, token counts and cost
      // — avoiding a full reload of the entire message list.
      const optimisticAssistant: ChatMessage = {
        id: 'temp-assistant-' + Date.now(),
        session_id: session.id,
        role: 'assistant',
        content: streamedContent,
        model_used: selectedModel,
        tokens_input: null,
        tokens_output: null,
        cost_usd: null,
        metadata: { thinking: thinkingSteps },
        thinking: thinkingSteps,
        created_at: new Date().toISOString(),
      }

      setMessages(prev => {
        const withoutTempUser = prev.filter(m => m.id !== userMessage.id)
        return [...withoutTempUser, { ...userMessage }, optimisticAssistant]
      })
      setStreamingContent('')
      setStreamingThinking([])

      // Background: fetch the last 2 messages to get real IDs + stored metadata
      const { messages: lastTwo } = await getMessages(session.id, 2)
      setMessages(prev => {
        const stable = prev.filter(m => !m.id.startsWith('temp-'))
        const stableIds = new Set(stable.map(m => m.id))
        const newOnes = lastTwo.filter(m => !stableIds.has(m.id))
        const updated = [...stable, ...newOnes]
        onCacheUpdate?.(session.id, updated)
        return updated
      })

      refreshContext()
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
      setMessages(prev => prev.filter(m => m.id !== userMessage.id))
      setStreamingContent('')
      setStreamingThinking([])
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
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-surface-container">
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
        ref={listRef}
        messages={messages}
        loading={loading}
        streamingContent={streamingContent}
        streaming={streaming}
        streamingThinking={streamingThinking}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={loadOlderMessages}
      />

      {/* Bottom Bar */}
      <div className="border-t border-[#f3f4f6] dark:border-white/[0.06] bg-white dark:bg-surface-container">
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
        <div className="px-6 pb-3 bg-[#fafbfc] dark:bg-surface-container-low">
          <div className={`mx-auto flex items-center justify-between text-xs ${isExpanded ? 'max-w-6xl' : 'max-w-4xl'}`}>
            {/* Left: Model Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#9ca3af] dark:text-on-surface-variant">Model:</span>
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={handleModelChange}
                disabled={streaming}
              />
            </div>

            {/* Right: Token Stats */}
            {messages.length > 0 && (
              <div className="flex items-center gap-2 text-[10px] text-[#6b7280] dark:text-on-surface-variant">
                <span>{(totalTokensInput + totalTokensOutput).toLocaleString()} tokens</span>
                <span className="text-[#d1d5db] dark:text-white/20">·</span>
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
