'use client'

import { MessageSquare, Clock, Trash2, CheckSquare, Square, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { ChatSession } from '@/types/chat'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface SessionListProps {
  sessions: ChatSession[]
  currentSessionId: string | null
  onSelectSession: (id: string) => void
  onNewSession: () => void
  onDeleteSessions: (ids: string[]) => void
}

export function SessionList({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSessions,
}: SessionListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSelecting, setIsSelecting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const toggleSelectMode = () => {
    setIsSelecting((v) => !v)
    setSelectedIds(new Set())
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selectedIds.size === sessions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(sessions.map((s) => s.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} conversation${selectedIds.size > 1 ? 's' : ''}?`)) return

    try {
      setDeleting(true)
      const ids = Array.from(selectedIds)

      const response = await fetch('/api/chat/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to delete')
      }

      toast.success(`${ids.length} conversation${ids.length > 1 ? 's' : ''} deleted`)
      onDeleteSessions(ids)
      setSelectedIds(new Set())
      setIsSelecting(false)
    } catch (error) {
      console.error('Error deleting sessions:', error)
      toast.error('Failed to delete conversations')
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteSingle = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this conversation?')) return

    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to delete')
      }

      toast.success('Conversation deleted')
      onDeleteSessions([sessionId])
    } catch (error) {
      console.error('Error deleting session:', error)
      toast.error('Failed to delete conversation')
    }
  }

  const allSelected = sessions.length > 0 && selectedIds.size === sessions.length

  return (
    <div className="flex flex-col h-full">
      {/* Multi-select toolbar */}
      {sessions.length > 0 && (
        <div className="px-2 pt-2 pb-1 flex items-center gap-1.5">
          {isSelecting ? (
            <>
              <button
                onClick={selectAll}
                className="flex items-center gap-1 text-[10px] font-semibold text-[#4f46e5] dark:text-[#7c7ff5] hover:text-[#4338ca] dark:hover:text-[#9b9df7] transition-colors"
              >
                {allSelected ? (
                  <CheckSquare className="w-3.5 h-3.5" />
                ) : (
                  <Square className="w-3.5 h-3.5" />
                )}
                {allSelected ? 'Deselect all' : 'Select all'}
              </button>

              {selectedIds.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={deleting}
                  className="ml-auto flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded text-[10px] font-bold hover:bg-red-600 disabled:opacity-60 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  {deleting ? 'Deleting…' : `Delete (${selectedIds.size})`}
                </button>
              )}

              <button
                onClick={toggleSelectMode}
                className="ml-auto p-1 text-[#6b7280] dark:text-on-surface-variant hover:text-[#191c1e] dark:hover:text-on-surface rounded transition-colors"
                title="Cancel selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={toggleSelectMode}
              className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-[#6b7280] dark:text-on-surface-variant hover:text-[#4f46e5] dark:hover:text-[#7c7ff5] transition-colors"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Select
            </button>
          )}
        </div>
      )}

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {sessions.length === 0 ? (
          <div className="text-center py-10 px-4">
              <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-[#f2f4f6] dark:bg-surface-container-high flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[#464554] dark:text-on-surface-variant" />
              </div>
              <p className="text-[10px] text-[#464554] dark:text-on-surface-variant font-semibold">No conversations yet</p>
              <p className="text-[9px] text-[#6b7280] dark:text-on-surface-variant/70 mt-0.5">Start a new chat to begin</p>
          </div>
        ) : (
          sessions.map((session) => {
            const isSelected = selectedIds.has(session.id)
            const isCurrent = currentSessionId === session.id

            return (
              <div
                key={session.id}
                className={`
                  group w-full p-2.5 rounded-lg transition-all relative
                  ${
                    isSelected
                      ? 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20'
                      : isCurrent
                      ? 'bg-gradient-to-br from-[#4f46e5]/10 to-[#6366f1]/10 dark:from-[#7c7ff5]/10 dark:to-[#7c7ff5]/10 border border-[#4f46e5]/20 dark:border-[#7c7ff5]/20'
                      : 'hover:bg-[#f7f9fb] dark:hover:bg-surface-container-high border border-transparent'
                  }
                `}
              >
                <div className="flex items-start gap-2">
                  {/* Checkbox (select mode) */}
                  {isSelecting && (
                    <button
                      onClick={() => toggleSelect(session.id)}
                      className="flex-shrink-0 mt-0.5 text-[#4f46e5]"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4 text-[#c4c8d0]" />
                      )}
                    </button>
                  )}

                  <button
                    onClick={() =>
                      isSelecting ? toggleSelect(session.id) : onSelectSession(session.id)
                    }
                    className="flex items-start gap-2 flex-1 min-w-0 text-left"
                  >
                    <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isCurrent && !isSelecting
                            ? 'bg-gradient-to-br from-[#4f46e5] to-[#6366f1] text-white'
                            : 'bg-[#f2f4f6] dark:bg-surface-container-high text-[#464554] dark:text-on-surface-variant'
                        }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-semibold truncate leading-tight ${
                          isCurrent && !isSelecting
                            ? 'text-[#191c1e] dark:text-on-surface'
                            : 'text-[#464554] dark:text-on-surface-variant group-hover:text-[#191c1e] dark:group-hover:text-on-surface'
                        }`}
                      >
                        {session.title || 'New Conversation'}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-2.5 h-2.5 text-[#6b7280] dark:text-on-surface-variant" />
                        <span className="text-[9px] text-[#6b7280] dark:text-on-surface-variant font-medium">
                          {formatDistanceToNow(new Date(session.last_activity_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Single delete (only when not in select mode) */}
                  {!isSelecting && (
                    <button
                      onClick={(e) => handleDeleteSingle(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-surface-container-high rounded transition-all flex-shrink-0"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3 h-3 text-gray-400 dark:text-on-surface-variant" />
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
