'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'

interface MessageInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({ onSend, disabled, placeholder }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSend() {
    if (!message.trim() || disabled) return
    onSend(message)
    setMessage('')
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInput() {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1 relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={placeholder || 'Type your message...'}
          disabled={disabled}
          className="min-h-[44px] max-h-[160px] resize-none border-[#e5e7eb] dark:border-white/[0.09] focus:border-[#4f46e5] dark:focus:border-[#7c7ff5] focus:ring-1 focus:ring-[#4f46e5]/20 dark:focus:ring-[#7c7ff5]/20 rounded-lg bg-white dark:bg-surface-container text-sm placeholder:text-[#9ca3af] dark:placeholder:text-on-surface-variant/50"
          rows={1}
        />
      </div>
      <Button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        size="icon"
        className="h-[44px] w-[44px] shrink-0 rounded-lg bg-[#4f46e5] dark:bg-[#7c7ff5] hover:bg-[#4338ca] dark:hover:bg-[#9b9df7] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}
