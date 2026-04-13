'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles, Plus } from 'lucide-react'
import { ChatInterfaceWrapper } from './ChatInterfaceWrapper'
import { SessionList } from './SessionList'
import type { ChatSession, ChatMessage } from '@/types/chat'

export function ChatPageClient() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // In-memory message cache: sessionId → messages[]
  // useRef so it persists across renders without triggering re-renders
  const messageCache = useRef<Map<string, ChatMessage[]>>(new Map())

  function handleCacheUpdate(sessionId: string, messages: ChatMessage[]) {
    messageCache.current.set(sessionId, messages)
  }

  useEffect(() => {
    loadSessions()
  }, [])

  async function loadSessions() {
    try {
      setLoading(true)
      const response = await fetch('/api/chat/sessions')

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to load sessions')
      }

      const { data } = await response.json()

      setSessions(data || [])

      // Only set currentSessionId if none is selected yet
      setCurrentSessionId((prev) => {
        if (prev) return prev
        return data && data.length > 0 ? data[0].id : null
      })
    } catch (error) {
      console.error('Error loading sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Silent refresh – updates the sessions list in the sidebar without
  // touching the page-level loading state (so ChatInterfaceWrapper never unmounts)
  async function refreshSessions() {
    try {
      const response = await fetch('/api/chat/sessions')
      if (!response.ok) return
      const { data } = await response.json()
      setSessions(data || [])
    } catch {
      // Non-critical, ignore
    }
  }

  async function createNewSession() {
    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Conversation',
          context_type: 'general',
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to create session')
      }

      const { data } = await response.json()

      setSessions((prev) => [data, ...prev])
      setCurrentSessionId(data.id)
    } catch (error) {
      console.error('Error creating session:', error)
    }
  }

  function handleDeleteSessions(ids: string[]) {
    setSessions((prev) => {
      const remaining = prev.filter((s) => !ids.includes(s.id))
      // If the current session was deleted, switch to the first remaining one
      if (currentSessionId && ids.includes(currentSessionId)) {
        setCurrentSessionId(remaining.length > 0 ? remaining[0].id : null)
      }
      return remaining
    })
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#f7f9fb] dark:bg-surface-container-low">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-[#e8eff3] dark:border-white/[0.06]" />
            <div className="absolute inset-0 rounded-full border-2 border-[#4f46e5] border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-[#464554] dark:text-on-surface-variant font-medium">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex bg-[#f7f9fb] dark:bg-surface-container-low">
      {/* Conversation History Sidebar - 300px fixed width */}
      <aside className="w-[300px] bg-white dark:bg-surface-container border-r border-[#e8eff3] dark:border-white/[0.06] flex flex-col">
        {/* Sidebar Header */}
          <div className="p-3 border-b border-[#e8eff3] dark:border-white/[0.06]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4f46e5] to-[#6366f1] flex items-center justify-center shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <h2 className="text-xs font-black text-[#191c1e] dark:text-on-surface tracking-tight leading-none">
                AI Assistant
              </h2>
              <p className="text-[9px] text-[#464554] dark:text-on-surface-variant mt-0.5">Conversations</p>
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
            onDeleteSessions={handleDeleteSessions}
          />
        </div>

        {/* Stats Footer */}
        <div className="p-3 border-t border-[#e8eff3] dark:border-white/[0.06] bg-[#fafbfc] dark:bg-surface-container-low">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[#464554] dark:text-on-surface-variant font-semibold">
              Total Chats
            </span>
            <span className="px-2 py-0.5 bg-white dark:bg-surface-container-high rounded font-bold text-[#4f46e5] dark:text-[#7c7ff5] border border-[#e8eff3] dark:border-white/[0.06] shadow-sm dark:shadow-none">
              {sessions.length}
            </span>
          </div>
        </div>
      </aside>

      {/* Chat Area - Flexible width */}
      <main className="flex-1 bg-[#fafbfc] dark:bg-surface-container-low overflow-hidden">
        {currentSessionId ? (
          <ChatInterfaceWrapper
            sessionId={currentSessionId}
            initialSession={sessions.find((s) => s.id === currentSessionId) ?? null}
            onSessionUpdate={refreshSessions}
            onNewChat={createNewSession}
            cachedMessages={messageCache.current.get(currentSessionId)}
            onCacheUpdate={handleCacheUpdate}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md px-6">
              <div className="w-16 h-16 mx-auto mb-5 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#6366f1] flex items-center justify-center shadow-lg shadow-[#4f46e5]/20">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-black text-[#191c1e] dark:text-on-surface mb-2 tracking-tight">
                Start a Conversation
              </h2>
              <p className="text-sm text-[#464554] dark:text-on-surface-variant mb-5 leading-relaxed">
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
