'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ChatInterfaceWrapper } from './ChatInterfaceWrapper'
import { SessionList } from './SessionList'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import type { ChatSession } from '@/types/chat'

export function ChatPageClient() {
  const router = useRouter()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSessions()
  }, [])

  async function loadSessions() {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('last_activity_at', { ascending: false })

      if (error) throw error

      setSessions(data || [])
      
      if (data && data.length > 0) {
        setCurrentSessionId(data[0].id)
      } else {
        await createNewSession()
      }
    } catch (error) {
      console.error('Error loading sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createNewSession() {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          title: 'New Conversation',
          context_type: 'general',
        })
        .select()
        .single()

      if (error) throw error

      setSessions((prev) => [data, ...prev])
      setCurrentSessionId(data.id)
    } catch (error) {
      console.error('Error creating session:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center px-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h1 className="ml-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
          AI Assistant
        </h1>
      </header>

      {/* Main Content */}
      <ResizablePanelGroup orientation="horizontal" className="flex-1">
        {/* Sidebar */}
        <ResizablePanel
          defaultSize={20}
          minSize={15}
          maxSize={40}
          className="bg-white dark:bg-gray-800"
        >
          <div className="h-full overflow-y-auto">
            <SessionList
              sessions={sessions}
              currentSessionId={currentSessionId}
              onSelectSession={setCurrentSessionId}
              onNewSession={createNewSession}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Chat Area */}
        <ResizablePanel defaultSize={80} className="bg-white dark:bg-gray-900">
          {currentSessionId ? (
            <ChatInterfaceWrapper sessionId={currentSessionId} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Select or create a conversation</p>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
