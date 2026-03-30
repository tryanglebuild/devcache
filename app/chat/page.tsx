'use client'

import { useState, useEffect } from 'react'
import { getSessions, createSession } from '@/lib/chat-api'
import type { ChatSession } from '@/types/chat'
import { SessionSidebar } from '@/components/chat/SessionSidebar'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    loadSessions()
  }

  async function loadSessions() {
    try {
      const data = await getSessions()
      setSessions(data)
      if (data.length > 0 && !currentSession) {
        setCurrentSession(data[0])
      }
    } catch (error) {
      console.error('Failed to load sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleNewSession() {
    try {
      const session = await createSession({ 
        title: `Chat ${new Date().toLocaleDateString()}` 
      })
      setSessions([session, ...sessions])
      setCurrentSession(session)
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  async function handleDeleteSession(id: string) {
    try {
      const { deleteSession } = await import('@/lib/chat-api')
      await deleteSession(id)
      
      const newSessions = sessions.filter(s => s.id !== id)
      setSessions(newSessions)
      
      if (currentSession?.id === id) {
        setCurrentSession(newSessions[0] || null)
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <SessionSidebar
        sessions={sessions}
        currentSession={currentSession}
        onSelectSession={setCurrentSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
      />
      
      <main className="flex-1 flex flex-col">
        {currentSession ? (
          <ChatInterface 
            session={currentSession}
            onSessionUpdate={loadSessions}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Welcome to AI Chat</h2>
              <p className="text-muted-foreground mb-4">
                Create a new chat to get started
              </p>
              <button
                onClick={handleNewSession}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                New Chat
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
