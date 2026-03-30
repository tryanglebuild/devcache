'use client'

import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { MessageSquare, X, Plus, Sparkles, History, Settings } from 'lucide-react'
import { ChatInterface } from './ChatInterface'
import { getSessions, createSession } from '@/lib/chat-api'
import type { ChatSession } from '@/types/chat'
import toast from 'react-hot-toast'
import { useChat } from '@/components/providers/ChatProvider'

export function ChatSidebar() {
  const { isChatOpen, closeChat } = useChat()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isChatOpen) {
      loadSessions()
    }
  }, [isChatOpen])

  async function loadSessions() {
    try {
      setLoading(true)
      const data = await getSessions()
      setSessions(data)
      
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
      toast.success('New chat created')
    } catch (error) {
      console.error('Failed to create session:', error)
      toast.error('Failed to create chat session')
    }
  }

  return (
    <Sheet open={isChatOpen} onOpenChange={closeChat} modal={false}>
      <SheetContent 
        side="right" 
        className="w-full sm:w-[500px] lg:w-[600px] p-0 flex flex-col gap-0 border-l border-[#e5e7eb] bg-[#ffffff]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <SheetTitle className="sr-only">AI Assistant Chat</SheetTitle>
        
        {/* Ultra-Minimal Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#4f46e5] flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-[#111827]">AI Chat</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={createNewSession}
              className="h-7 w-7 hover:bg-[#f3f4f6] rounded-md"
              title="New Chat"
            >
              <Plus className="h-4 w-4 text-[#6b7280]" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeChat}
              className="h-7 w-7 hover:bg-[#f3f4f6] rounded-md"
            >
              <X className="h-4 w-4 text-[#6b7280]" />
            </Button>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden bg-[#ffffff]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="relative w-10 h-10 mx-auto mb-3">
                  <div className="absolute inset-0 rounded-full border-2 border-[#f3f4f6]" />
                  <div className="absolute inset-0 rounded-full border-2 border-[#4f46e5] border-t-transparent animate-spin" />
                </div>
                <p className="text-xs text-[#6b7280]">Loading...</p>
              </div>
            </div>
          ) : currentSession ? (
            <ChatInterface 
              session={currentSession} 
              onSessionUpdate={loadSessions}
            />
          ) : (
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center max-w-xs">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#f9fafb] flex items-center justify-center">
                  <MessageSquare className="h-7 w-7 text-[#9ca3af]" />
                </div>
                <h3 className="text-sm font-semibold text-[#111827] mb-1.5">No conversation yet</h3>
                <p className="text-xs text-[#6b7280] mb-4 leading-relaxed">
                  Start chatting with AI to get help with your work
                </p>
                <Button
                  onClick={createNewSession}
                  size="sm"
                  className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs h-8 px-4"
                >
                  Start Chat
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
