'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChatInterface } from './ChatInterface'
import type { ChatSession } from '@/types/chat'
import { Loader2 } from 'lucide-react'

interface ChatInterfaceWrapperProps {
  sessionId: string
  onSessionUpdate?: () => void
  onNewChat?: () => void
  isExpanded?: boolean
}

export function ChatInterfaceWrapper({ sessionId, onSessionUpdate, onNewChat, isExpanded }: ChatInterfaceWrapperProps) {
  const [session, setSession] = useState<ChatSession | null>(null)
  const [loading, setLoading] = useState(false) // Changed from true to false

  useEffect(() => {
    loadSession()
  }, [sessionId])

  async function loadSession() {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (error) throw error
      setSession(data)
    } catch (error) {
      console.error('Error loading session:', error)
    } finally {
      setLoading(false)
    }
  }

  // Show chat interface immediately with minimal loading
  if (!session && !loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <p className="text-sm text-[#464554] font-medium">Session not found</p>
      </div>
    )
  }

  // Show interface even while loading session metadata
  return <ChatInterface session={session || { id: sessionId } as ChatSession} onSessionUpdate={loadSession} onParentUpdate={onSessionUpdate} onNewChat={onNewChat} isExpanded={isExpanded} />
}
