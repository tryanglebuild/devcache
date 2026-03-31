'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChatInterface } from './ChatInterface'
import type { ChatSession } from '@/types/chat'
import { Loader2 } from 'lucide-react'

interface ChatInterfaceWrapperProps {
  sessionId: string
  onSessionUpdate?: () => void
}

export function ChatInterfaceWrapper({ sessionId, onSessionUpdate }: ChatInterfaceWrapperProps) {
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Session not found</p>
      </div>
    )
  }

  return <ChatInterface session={session} onSessionUpdate={loadSession} onParentUpdate={onSessionUpdate} />
}
