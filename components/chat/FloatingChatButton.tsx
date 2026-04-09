'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { MessageSquare } from 'lucide-react'
import { FloatingChatWindow } from './FloatingChatWindow'

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [prefetched, setPrefetched] = useState(false)
  const pathname = usePathname()

  // Prefetch sessions on hover for instant loading
  const handleMouseEnter = () => {
    if (!prefetched && !isOpen) {
      // Prefetch sessions in background
      fetch('/api/chat/sessions')
        .then(res => res.json())
        .catch(() => {}) // Silent fail
      setPrefetched(true)
    }
  }

  // Hide chat button on support pages, chat page, and CLI auth page
  const shouldHideButton = pathname?.startsWith('/support') || pathname === '/chat' || pathname?.startsWith('/auth/cli')

  if (shouldHideButton) {
    return null
  }

  return (
    <>
      {/* Floating Button - Only show when chat is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          onMouseEnter={handleMouseEnter}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Open chat"
        >
          <div className="relative">
            {/* Main Button */}
            <div className="w-14 h-14 rounded-full shadow-lg dark:shadow-none bg-blue-600 hover:bg-blue-700 hover:scale-110 hover:shadow-xl flex items-center justify-center transition-all duration-300 ease-out">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>

            {/* Unread Badge */}
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-[10px] font-bold text-white">{unreadCount}</span>
              </div>
            )}

            {/* Pulse Animation */}
            <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20 dark:opacity-10" />
          </div>
        </button>
      )}

      {/* Floating Chat Window */}
      <FloatingChatWindow open={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
