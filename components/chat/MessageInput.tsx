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
    <div className="border-t border-[#e5e7eb] p-3 bg-[#ffffff]">
      <div className="flex gap-2 items-end">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={placeholder || 'Ask anything...'}
          disabled={disabled}
          className="min-h-[40px] max-h-[120px] resize-none border-[#e5e7eb] focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] rounded-lg bg-[#ffffff] text-sm placeholder:text-[#9ca3af]"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          size="icon"
          className="h-[40px] w-[40px] shrink-0 rounded-lg bg-[#4f46e5] hover:bg-[#4338ca] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-[9px] text-[#9ca3af] mt-1.5 px-1">
        <kbd className="px-1 py-0.5 bg-[#f3f4f6] rounded text-[8px] font-mono border border-[#e5e7eb]">↵</kbd> send • <kbd className="px-1 py-0.5 bg-[#f3f4f6] rounded text-[8px] font-mono border border-[#e5e7eb]">⇧↵</kbd> new line
      </p>
    </div>
  )
}
