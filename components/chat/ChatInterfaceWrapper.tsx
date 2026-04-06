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
  const [loading, setLoading] = useState(true)

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

  // Show minimal loading state - let ChatInterface handle message loading
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full border-2 border-[#e8eff3]" />
          <div className="absolute inset-0 rounded-full border-2 border-[#4f46e5] border-t-transparent animate-spin" />
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <p className="text-sm text-[#464554] font-medium">Session not found</p>
      </div>
    )
  }

  return <ChatInterface session={session} onSessionUpdate={loadSession} onParentUpdate={onSessionUpdate} onNewChat={onNewChat} isExpanded={isExpanded} />
}
