'use client'

import { useState, useEffect } from 'react'
import { X, Maximize2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChatInterfaceWrapper } from './ChatInterfaceWrapper'
import { SessionList } from './SessionList'
import type { ChatSession } from '@/types/chat'
import toast from 'react-hot-toast'

interface ChatModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChatModal({ open, onOpenChange }: ChatModalProps) {
  const router = useRouter()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      loadSessions()
    }
  }, [open])

  async function loadSessions() {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('last_activity_at', { ascending: false })
        .limit(20)

      if (error) throw error

      setSessions(data || [])
      
      if (data && data.length > 0) {
        setCurrentSessionId(data[0].id)
      } else {
        await createNewSession()
      }
    } catch (error) {
      console.error('Error loading sessions:', error)
      toast.error('Failed to load chat sessions')
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
      toast.error('Failed to create chat session')
    }
  }

  function handleDeleteSessions(ids: string[]) {
    setSessions((prev) => {
      const remaining = prev.filter((s) => !ids.includes(s.id))
      if (currentSessionId && ids.includes(currentSessionId)) {
        setCurrentSessionId(remaining.length > 0 ? remaining[0].id : null)
      }
      return remaining
    })
  }

  function handleExpandToPage() {
    router.push('/chat')
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      {/* Modal Container - Largura aumentada */}
      <div
        className="relative w-full max-w-7xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Simplificado */}
        <div className="flex-shrink-0 h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                AI Assistant
              </h2>
              <p className="text-xs text-gray-500">
                Find templates and get help
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleExpandToPage}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-600"
              title="Expand to full page"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="hidden sm:inline">Expand</span>
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 flex">
          {/* Sidebar - 20% width */}
          <div className="w-[20%] bg-gray-50 border-r border-gray-200 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Loading...</p>
                </div>
              </div>
            ) : (
              <SessionList
                sessions={sessions}
                currentSessionId={currentSessionId}
                onSelectSession={setCurrentSessionId}
                onNewSession={createNewSession}
                onDeleteSessions={handleDeleteSessions}
              />
            )}
          </div>

          {/* Chat Area - 80% width */}
          <div className="w-[80%] bg-white">
            {currentSessionId ? (
              <ChatInterfaceWrapper sessionId={currentSessionId} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Select or create a conversation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
