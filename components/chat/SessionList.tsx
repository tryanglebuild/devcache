'use client'

import { MessageSquare, Clock, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { ChatSession } from '@/types/chat'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface SessionListProps {
  sessions: ChatSession[]
  currentSessionId: string | null
  onSelectSession: (id: string) => void
  onNewSession: () => void
}

export function SessionList({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
}: SessionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return
    }

    try {
      setDeletingId(sessionId)
      const supabase = createClient()
      
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)

      if (error) throw error

      toast.success('Conversation deleted')
      
      // Reload page to refresh session list
      window.location.reload()
    } catch (error) {
      console.error('Error deleting session:', error)
      toast.error('Failed to delete conversation')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {sessions.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-[#f2f4f6] flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#464554]" />
            </div>
            <p className="text-[10px] text-[#464554] font-semibold">No conversations yet</p>
            <p className="text-[9px] text-[#6b7280] mt-0.5">Start a new chat to begin</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`
                group w-full p-2.5 rounded-lg transition-all relative
                ${
                  currentSessionId === session.id
                    ? 'bg-gradient-to-br from-[#4f46e5]/10 to-[#6366f1]/10 border border-[#4f46e5]/20'
                    : 'hover:bg-[#f7f9fb] border border-transparent'
                }
              `}
            >
              <div className="flex items-start gap-2">
                <button
                  onClick={() => onSelectSession(session.id)}
                  className="flex items-start gap-2 flex-1 min-w-0 text-left"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    currentSessionId === session.id
                      ? 'bg-gradient-to-br from-[#4f46e5] to-[#6366f1] text-white'
                      : 'bg-[#f2f4f6] text-[#464554]'
                  }`}>
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate leading-tight ${
                      currentSessionId === session.id
                        ? 'text-[#191c1e]'
                        : 'text-[#464554] group-hover:text-[#191c1e]'
                    }`}>
                      {session.title || 'New Conversation'}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-2.5 h-2.5 text-[#6b7280]" />
                      <span className="text-[9px] text-[#6b7280] font-medium">
                        {formatDistanceToNow(new Date(session.last_activity_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </button>
                
                {/* Delete Button */}
                <button
                  onClick={(e) => handleDelete(session.id, e)}
                  disabled={deletingId === session.id}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all flex-shrink-0"
                  title="Delete conversation"
                >
                  <Trash2 className="w-3 h-3 text-red-500" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
