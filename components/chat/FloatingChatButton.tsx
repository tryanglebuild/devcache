'use client'

import { useState } from 'react'
import { MessageSquare, X } from 'lucide-react'
import { ChatModal } from './ChatModal'

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <div className="relative">
          {/* Main Button */}
          <div
            className={`
            w-14 h-14 rounded-full shadow-lg
            flex items-center justify-center
            transition-all duration-300 ease-out
            ${
              isOpen
                ? 'bg-gray-800 dark:bg-gray-700 rotate-90 scale-95'
                : 'bg-blue-600 hover:bg-blue-700 hover:scale-110 hover:shadow-xl'
            }
          `}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <MessageSquare className="w-6 h-6 text-white" />
            )}
          </div>

          {/* Unread Badge */}
          {!isOpen && unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-[10px] font-bold text-white">{unreadCount}</span>
            </div>
          )}

          {/* Pulse Animation (when not open) */}
          {!isOpen && (
            <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20" />
          )}
        </div>
      </button>

      {/* Chat Modal */}
      <ChatModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
