'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface MarkdownCodeBlockProps {
  children: string
  className?: string
}

export function MarkdownCodeBlock({ children, className }: MarkdownCodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Extract language from className (e.g., "language-javascript")
  const language = className?.replace('language-', '') || 'text'

  return (
    <div className="relative group">
      {/* Language badge and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#e8eaed] border-b border-[#c7c4d7]/30 rounded-t-lg">
        <span className="text-xs font-bold text-[#464554] uppercase tracking-wider">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="p-1.5 bg-white border border-[#c7c4d7]/30 text-[#191c1e] rounded-md hover:bg-[#f2f4f6] transition-all"
          title={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-[#16a34a]" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Code content */}
      <pre className="!mt-0 !rounded-t-none">
        <code className={className}>{children}</code>
      </pre>
    </div>
  )
}
