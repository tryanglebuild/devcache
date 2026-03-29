'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import { MarkdownCodeBlock } from '@/components/projects/MarkdownCodeBlock'

interface TemplateContentViewerProps {
  content: string
  viewMode: 'rendered' | 'source'
}

export function TemplateContentViewer({ content, viewMode }: TemplateContentViewerProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyContent = async () => {
    if (!content) {
      toast.error('No content to copy')
      return
    }

    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      toast.success('Content copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy error:', error)
      toast.error('Failed to copy content')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">
      {/* Copy Button */}
      <div className="flex justify-end px-6 pt-6 pb-2 border-b border-[#e5e7eb]">
        <button
          onClick={handleCopyContent}
          className="p-2.5 bg-white border border-[#c7c4d7]/30 text-[#191c1e] rounded-lg hover:bg-[#f2f4f6] transition-all"
          title="Copy content"
        >
          {copied ? (
            <Check className="h-4 w-4 text-[#16a34a]" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="p-8">
        {viewMode === 'rendered' ? (
          <div className="prose prose-slate max-w-none">
            <ReactMarkdown
              components={{
                code({ node, className, children, ...props }) {
                  const content = String(children).replace(/\n$/, '')
                  const isInline = !className?.startsWith('language-')
                  
                  if (isInline) {
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  }
                  
                  return (
                    <MarkdownCodeBlock className={className}>
                      {content}
                    </MarkdownCodeBlock>
                  )
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="relative">
            <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-6 rounded-lg overflow-x-auto">
              <code>{content}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
