'use client'

import type { ChatSession } from '@/types/chat'
import { Plus, MessageSquare, Trash2 } from 'lucide-react'

interface SessionSidebarProps {
  sessions: ChatSession[]
  currentSession: ChatSession | null
  onSelectSession: (session: ChatSession) => void
  onNewSession: () => void
  onDeleteSession: (id: string) => void
}

export function SessionSidebar({
  sessions,
  currentSession,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}: SessionSidebarProps) {
  return (
    <aside className="w-64 border-r bg-card flex flex-col">
      <div className="p-4 border-b">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No chats yet
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`
                  group relative flex items-center gap-2 p-3 rounded-md cursor-pointer transition-colors
                  ${currentSession?.id === session.id 
                    ? 'bg-accent text-accent-foreground' 
                    : 'hover:bg-accent/50'
                  }
                `}
                onClick={() => onSelectSession(session)}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 truncate text-sm">
                  {session.title}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('Delete this chat?')) {
                      onDeleteSession(session.id)
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-opacity"
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t text-xs text-muted-foreground">
        {sessions.length} chat{sessions.length !== 1 ? 's' : ''}
      </div>
    </aside>
  )
}
