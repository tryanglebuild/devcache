'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Maximize2, Minimize2, Plus, MessageSquare, Clock, Edit2, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ChatInterfaceWrapper } from './ChatInterfaceWrapper'
import type { ChatSession } from '@/types/chat'
import toast from 'react-hot-toast'

interface FloatingChatWindowProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prefetchedSession?: ChatSession | null
}

export function FloatingChatWindow({ open, onOpenChange, prefetchedSession }: FloatingChatWindowProps) {
  const router = useRouter()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      if (prefetchedSession) {
        // Session was pre-created on hover — use it instantly, no loading
        setSessions([prefetchedSession])
        setCurrentSessionId(prefetchedSession.id)
        setCurrentSession(prefetchedSession)
      } else {
        // Fallback: create a new session now (user clicked without hovering first)
        createNewSession(true)
      }
    } else {
      // Reset state when closed so next open starts clean
      setSessions([])
      setCurrentSessionId(null)
      setCurrentSession(null)
      setLoading(false)
    }
  }, [open])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowHistoryDropdown(false)
      }
    }

    if (showHistoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showHistoryDropdown])

  // Escape key: collapse if expanded, close if compact
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && open) {
        if (isExpanded) {
          setIsExpanded(false)
        } else {
          onOpenChange(false)
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, isExpanded, onOpenChange])

  async function loadSessions() {
    try {
      const response = await fetch('/api/chat/sessions')
      if (!response.ok) throw new Error('Failed to load sessions')
      const { data } = await response.json()
      // Merge with existing list (current new session stays selected)
      setSessions((prev) => {
        const existingIds = new Set(prev.map((s) => s.id))
        const incoming = (data || []).filter((s: ChatSession) => !existingIds.has(s.id))
        return [...prev, ...incoming]
      })
    } catch (error) {
      console.error('Error loading sessions:', error)
      toast.error('Failed to load chat history')
    }
  }

  async function createNewSession(silent = false) {
    try {
      setLoading(true)
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Conversation',
          context_type: 'general',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create session')
      }

      const { data } = await response.json()

      setSessions((prev) => [data, ...prev])
      setCurrentSessionId(data.id)
      setCurrentSession(data)
      setShowHistoryDropdown(false)
      if (!silent) toast.success('New chat created')
    } catch (error) {
      console.error('Error creating session:', error)
      toast.error('Failed to create chat session')
    } finally {
      setLoading(false)
    }
  }

  async function updateSessionTitle(sessionId: string, newTitle: string) {
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      })

      if (!response.ok) {
        throw new Error('Failed to update title')
      }

      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId ? { ...session, title: newTitle } : session
        )
      )
      
      setEditingSessionId(null)
      toast.success('Chat title updated')
    } catch (error) {
      console.error('Error updating session title:', error)
      toast.error('Failed to update title')
    }
  }

  function handleExpandToPage() {
    router.push('/chat')
    onOpenChange(false)
  }

  function handleSelectSession(sessionId: string) {
    const session = sessions.find(s => s.id === sessionId) ?? null
    setCurrentSessionId(sessionId)
    setCurrentSession(session)
    setShowHistoryDropdown(false)
  }

  function startEditingTitle(session: ChatSession) {
    setEditingSessionId(session.id)
    setEditingTitle(session.title)
  }

  function cancelEditing() {
    setEditingSessionId(null)
    setEditingTitle('')
  }

  function saveTitle(sessionId: string) {
    if (editingTitle.trim()) {
      updateSessionTitle(sessionId, editingTitle.trim())
    } else {
      cancelEditing()
    }
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop for expanded mode — sits above the sidebar (z-50) */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Floating Chat Window */}
      <div
        className={`
          fixed bg-white dark:bg-surface-container rounded-2xl shadow-2xl dark:shadow-none dark:ring-1 dark:ring-white/[0.08]
          flex flex-col overflow-hidden transition-all duration-300 ease-out
          ${
            isExpanded
              ? 'z-[70] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[85vh] max-w-6xl'
              : 'z-[70] bottom-6 right-6 w-[500px] h-[700px]'
          }
        `}
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)'
        }}
      >
        {/* Header */}
        <div className="flex-shrink-0 h-14 border-b border-gray-200 dark:border-white/[0.09] bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                {currentSession?.title || 'AI Assistant'}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {/* New Chat Button */}
            <button
              onClick={() => createNewSession()}
              className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
              title="New chat"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* History Dropdown Button */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  const next = !showHistoryDropdown
                  setShowHistoryDropdown(next)
                  if (next) loadSessions()
                }}
                className={`p-2 rounded-lg transition-colors ${
                  showHistoryDropdown 
                    ? 'bg-white/20 text-white' 
                    : 'hover:bg-white/10 text-white'
                }`}
                title="Chat history"
              >
                <Clock className="w-4 h-4" />
              </button>

              {/* History Dropdown */}
              {showHistoryDropdown && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-surface-container rounded-xl shadow-2xl dark:shadow-none dark:ring-1 dark:ring-white/[0.08] border border-gray-200 dark:border-white/[0.09] overflow-hidden z-50">
                  {/* Dropdown Header */}
                  <div className="p-3 border-b border-gray-200 dark:border-white/[0.09] bg-gray-50 dark:bg-surface-container-high">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-on-surface">Chat History</h3>
                      <button
                        onClick={() => createNewSession()}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        New
                      </button>
                    </div>
                  </div>

                  {/* Sessions List */}
                  <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                      <div className="p-8 text-center">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-xs text-gray-500 dark:text-on-surface-variant">Loading...</p>
                      </div>
                    ) : sessions.length === 0 ? (
                      <div className="p-8 text-center">
                        <MessageSquare className="w-8 h-8 text-gray-300 dark:text-on-surface-variant/40 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-on-surface-variant">No conversations yet</p>
                      </div>
                    ) : (
                      sessions.map((session) => (
                        <div
                          key={session.id}
                          className={`p-3 border-b border-gray-100 dark:border-white/[0.06] hover:bg-gray-50 dark:hover:bg-surface-container-high transition-colors ${
                            session.id === currentSessionId ? 'bg-blue-50 dark:bg-blue-500/10' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-gray-400 dark:text-on-surface-variant mt-1 flex-shrink-0" />
                            
                            <div className="flex-1 min-w-0">
                              {editingSessionId === session.id ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveTitle(session.id)
                                      if (e.key === 'Escape') cancelEditing()
                                    }}
                                    className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-surface-container text-gray-900 dark:text-on-surface"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => saveTitle(session.id)}
                                    className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 rounded"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={cancelEditing}
                                    className="p-1 text-gray-400 dark:text-on-surface-variant hover:bg-gray-100 dark:hover:bg-surface-container-high rounded"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleSelectSession(session.id)}
                                  className="w-full text-left"
                                >
                                  <p className="text-sm font-medium text-gray-900 dark:text-on-surface truncate">
                                    {session.title}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-on-surface-variant mt-0.5">
                                    {new Date(session.last_activity_at).toLocaleDateString()}
                                  </p>
                                </button>
                              )}
                            </div>

                            {editingSessionId !== session.id && (
                              <button
                                onClick={() => startEditingTitle(session)}
                                className="p-1 text-gray-400 dark:text-on-surface-variant hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded transition-colors"
                                title="Edit title"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Expand/Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title={isExpanded ? 'Minimize' : 'Expand'}
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4 text-white" />
              ) : (
                <Maximize2 className="w-4 h-4 text-white" />
              )}
            </button>

            {/* Full Page Button */}
            <button
              onClick={handleExpandToPage}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Open in full page"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>

            {/* Close Button */}
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 flex">
          {/* Chat Area */}
          <div className="flex-1 bg-white dark:bg-surface-container overflow-hidden">
            {currentSessionId ? (
              <ChatInterfaceWrapper 
                sessionId={currentSessionId}
                initialSession={currentSession}
                onSessionUpdate={loadSessions}
                onNewChat={() => createNewSession()}
                isExpanded={isExpanded}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-white dark:bg-surface-container">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 rounded-full border-2 border-[#e8eff3] dark:border-white/[0.09]" />
                  <div className="absolute inset-0 rounded-full border-2 border-[#4f46e5] dark:border-[#7c7ff5] border-t-transparent animate-spin" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Bar (only in compact mode) */}
      </div>
    </>
  )
}
