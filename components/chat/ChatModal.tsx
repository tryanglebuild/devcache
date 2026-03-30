'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { MessageSquare } from 'lucide-react'
import { ChatInterface } from './ChatInterface'
import { getSessions, createSession } from '@/lib/chat-api'
import type { ChatSession } from '@/types/chat'
import toast from 'react-hot-toast'

interface ChatModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChatModal({ open, onOpenChange }: ChatModalProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      loadSessions()
    }
  }, [open])

  async function loadSessions() {
    try {
      setLoading(true)
      const data = await getSessions()
      setSessions(data)
      
      // Use the most recent session or create a new one
      if (data.length > 0) {
        setCurrentSession(data[0])
      } else {
        await createNewSession()
      }
    } catch (error) {
      console.error('Failed to load sessions:', error)
      toast.error('Failed to load chat sessions')
    } finally {
      setLoading(false)
    }
  }

  async function createNewSession() {
    try {
      const newSession = await createSession({
        title: 'New Chat',
        context_type: 'general',
      })
      setSessions(prev => [newSession, ...prev])
      setCurrentSession(newSession)
    } catch (error) {
      console.error('Failed to create session:', error)
      toast.error('Failed to create chat session')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            AI Assistant
          </DialogTitle>
          <DialogDescription className="sr-only">
            Chat with AI assistant to get help with your projects
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Loading chat...</p>
              </div>
            </div>
          ) : currentSession ? (
            <ChatInterface 
              session={currentSession} 
              onSessionUpdate={loadSessions}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">No chat session available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
