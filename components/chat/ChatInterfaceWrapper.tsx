'use client'

import { useState, useEffect } from 'react'
import { ChatInterface } from './ChatInterface'
import type { ChatSession, ChatMessage } from '@/types/chat'

interface ChatInterfaceWrapperProps {
  sessionId: string
  initialSession?: ChatSession | null
  onSessionUpdate?: () => void
  onNewChat?: () => void
  isExpanded?: boolean
  cachedMessages?: ChatMessage[]
  onCacheUpdate?: (sessionId: string, messages: ChatMessage[]) => void
}

export function ChatInterfaceWrapper({ sessionId, initialSession, onSessionUpdate, onNewChat, isExpanded, cachedMessages, onCacheUpdate }: ChatInterfaceWrapperProps) {
  const [session, setSession] = useState<ChatSession | null>(initialSession ?? null)
  const [loading, setLoading] = useState(!initialSession)

  useEffect(() => {
    // If a pre-loaded session was supplied and it matches, use it directly
    if (initialSession && initialSession.id === sessionId) {
      setSession(initialSession)
      setLoading(false)
      return
    }
    loadSession()
  }, [sessionId])

  async function loadSession() {
    try {
      setLoading(true)
      const res = await fetch(`/api/chat/sessions/${sessionId}`)
      if (!res.ok) throw new Error('Session not found')
      const { data } = await res.json()
      setSession(data)
    } catch (error) {
      console.error('Error loading session:', error)
      setSession(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-surface-container">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full border-2 border-[#e8eff3] dark:border-white/[0.09]" />
          <div className="absolute inset-0 rounded-full border-2 border-[#4f46e5] dark:border-[#7c7ff5] border-t-transparent animate-spin" />
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-surface-container">
        <p className="text-sm text-[#464554] dark:text-on-surface-variant font-medium">Session not found</p>
      </div>
    )
  }

  return (
    <ChatInterface
      session={session}
      onSessionUpdate={loadSession}
      onParentUpdate={onSessionUpdate}
      onNewChat={onNewChat}
      isExpanded={isExpanded}
      cachedMessages={cachedMessages}
      onCacheUpdate={onCacheUpdate}
    />
  )
}
