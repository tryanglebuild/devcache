'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ChatInterfaceWrapper } from './ChatInterfaceWrapper'
import { SessionList } from './SessionList'
import type { ChatSession } from '@/types/chat'

export function ChatPageClient() {
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
      
      // Load all sessions for conversation history
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('last_activity_at', { ascending: false })

      if (error) throw error

      setSessions(data || [])
      
      if (data && data.length > 0) {
        setCurrentSessionId(data[0].id)
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
      <div className="h-full flex items-center justify-center bg-[#f7f9fb]">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-[#e8eff3]" />
            <div className="absolute inset-0 rounded-full border-2 border-[#4f46e5] border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-[#464554] font-medium">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex bg-[#f7f9fb]">
      {/* Conversation History Sidebar - 300px fixed width */}
      <aside className="w-[300px] bg-white border-r border-[#e8eff3] flex flex-col">
        {/* Sidebar Header */}
        <div className="p-3 border-b border-[#e8eff3]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4f46e5] to-[#6366f1] flex items-center justify-center shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <h2 className="text-xs font-black text-[#191c1e] tracking-tight leading-none">
                AI Assistant
              </h2>
              <p className="text-[9px] text-[#464554] mt-0.5">Conversations</p>
            </div>
          </div>
          
          <button
            onClick={createNewSession}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-br from-[#4f46e5] to-[#6366f1] text-white rounded-lg font-semibold text-xs shadow-md shadow-[#4f46e5]/20 hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New Chat
          </button>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <SessionList
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={setCurrentSessionId}
            onNewSession={createNewSession}
          />
        </div>

        {/* Stats Footer */}
        <div className="p-3 border-t border-[#e8eff3] bg-[#fafbfc]">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[#464554] font-semibold">
              Total Chats
            </span>
            <span className="px-2 py-0.5 bg-white rounded font-bold text-[#4f46e5] border border-[#e8eff3] shadow-sm">
              {sessions.length}
            </span>
          </div>
        </div>
      </aside>

      {/* Chat Area - Flexible width */}
      <main className="flex-1 bg-[#fafbfc] overflow-hidden">
        {currentSessionId ? (
          <ChatInterfaceWrapper 
            sessionId={currentSessionId}
            onSessionUpdate={loadSessions}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md px-6">
              <div className="w-16 h-16 mx-auto mb-5 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#6366f1] flex items-center justify-center shadow-lg shadow-[#4f46e5]/20">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-black text-[#191c1e] mb-2 tracking-tight">
                Start a Conversation
              </h2>
              <p className="text-sm text-[#464554] mb-5 leading-relaxed">
                Create a new conversation or select one from your history to continue chatting with AI.
              </p>
              <button
                onClick={createNewSession}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-[#4f46e5] to-[#6366f1] text-white rounded-lg font-bold text-sm shadow-lg shadow-[#4f46e5]/20 hover:shadow-xl hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4" />
                Create New Chat
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
