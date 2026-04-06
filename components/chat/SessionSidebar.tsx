'use client'

import { useEffect, useState } from 'react'
import type { ChatSession } from '@/types/chat'
import { MessageSquare, Trash2 } from 'lucide-react'

interface SessionSidebarProps {
  sessions: ChatSession[]
  currentSession: ChatSession | null
  onSelectSession: (session: ChatSession) => void
  onNewSession: () => void
  onDeleteSession: (id: string) => void
}

interface SessionUsage {
  [sessionId: string]: {
    totalTokens: number
    totalCost: number
  }
}

export function SessionSidebar({
  sessions,
  currentSession,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}: SessionSidebarProps) {
  const [sessionUsage, setSessionUsage] = useState<SessionUsage>({})

  useEffect(() => {
    // Fetch usage for all sessions
    const fetchUsage = async () => {
      const usageData: SessionUsage = {}
      
      for (const session of sessions) {
        try {
          const response = await fetch(`/api/chat/usage?sessionId=${session.id}`)
          if (response.ok) {
            const data = await response.json()
            usageData[session.id] = {
              totalTokens: data.totalTokens || 0,
              totalCost: parseFloat(data.totalCost) || 0,
            }
          }
        } catch (error) {
          console.error(`Failed to fetch usage for session ${session.id}:`, error)
        }
      }
      
      setSessionUsage(usageData)
    }

    if (sessions.length > 0) {
      fetchUsage()
    }
  }, [sessions])

  return (
    <aside className="w-72 border-r border-[#e5e7eb] bg-white flex flex-col">
      {/* Header - Minimalist */}
      <div className="p-4 border-b border-[#e5e7eb]">
        <h2 className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wide">Conversations</h2>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-[#f3f4f6] flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#9ca3af]" />
            </div>
            <p className="text-sm text-[#6b7280]">No chats yet</p>
            <p className="text-xs text-[#9ca3af] mt-1">Start a conversation</p>
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {sessions.map((session) => {
              const usage = sessionUsage[session.id]
              const isActive = currentSession?.id === session.id
              
              return (
                <div
                  key={session.id}
                  className={`
                    group relative flex flex-col gap-1 p-2.5 rounded-lg cursor-pointer transition-colors
                    ${isActive
                      ? 'bg-[#f3f4f6]' 
                      : 'hover:bg-[#f9fafb]'
                    }
                  `}
                  onClick={() => onSelectSession(session)}
                >
                  {/* Title Row */}
                  <div className="flex items-start gap-2">
                    <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${
                      isActive ? 'text-[#4f46e5]' : 'text-[#9ca3af]'
                    }`} />
                    <span className={`flex-1 truncate text-sm leading-tight ${
                      isActive ? 'text-[#111827] font-medium' : 'text-[#374151]'
                    }`}>
                      {session.title}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Delete this chat?')) {
                          onDeleteSession(session.id)
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-500 rounded transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Token Usage Row - Minimalist */}
                  {usage && usage.totalTokens > 0 && (
                    <div className="flex items-center gap-2 ml-5 text-[10px] text-[#9ca3af]">
                      <span>{usage.totalTokens.toLocaleString()} tokens</span>
                      <span>·</span>
                      <span className="text-[#059669]">${usage.totalCost.toFixed(4)}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer Stats - Minimalist */}
      <div className="p-3 border-t border-[#e5e7eb]">
        <div className="flex items-center justify-between text-[10px] text-[#9ca3af]">
          <span>{sessions.length} {sessions.length === 1 ? 'chat' : 'chats'}</span>
          {Object.keys(sessionUsage).length > 0 && (
            <span>
              {Object.values(sessionUsage)
                .reduce((sum, u) => sum + u.totalTokens, 0)
                .toLocaleString()} tokens
            </span>
          )}
        </div>
      </div>
    </aside>
  )
}
