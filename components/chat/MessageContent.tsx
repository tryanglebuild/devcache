'use client'

import ReactMarkdown from 'react-markdown'
import { TemplateCard } from './TemplateCard'

interface MessageContentProps {
  content: string
  templateMetadata?: Record<string, any>
}

interface ParsedContent {
  type: 'text' | 'template'
  content: string
  templateId?: string
  templateName?: string
  metadata?: any
}

/**
 * Parse message content to extract template cards
 * Format: [TEMPLATE:template_id:template_name]
 */
function parseMessageContent(content: string, metadata?: Record<string, any>): ParsedContent[] {
  const parts: ParsedContent[] = []
  const templateRegex = /\[TEMPLATE:([^:]+):([^\]]+)\]/g
  
  let lastIndex = 0
  let match

  while ((match = templateRegex.exec(content)) !== null) {
    // Add text before template
    if (match.index > lastIndex) {
      const textContent = content.substring(lastIndex, match.index).trim()
      if (textContent) {
        parts.push({
          type: 'text',
          content: textContent,
        })
      }
    }

    // Add template card
    const templateId = match[1]
    const templateName = match[2]
    
    parts.push({
      type: 'template',
      content: '',
      templateId,
      templateName,
      metadata: metadata?.[templateId],
    })

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < content.length) {
    const textContent = content.substring(lastIndex).trim()
    if (textContent) {
      parts.push({
        type: 'text',
        content: textContent,
      })
    }
  }

  // If no templates found, return original content as text
  if (parts.length === 0) {
    parts.push({
      type: 'text',
      content: content,
    })
  }

  return parts
}

export function MessageContent({ content, templateMetadata }: MessageContentProps) {
  const parts = parseMessageContent(content, templateMetadata)

  return (
    <div className="space-y-3">
      {parts.map((part, index) => {
        if (part.type === 'template' && part.templateId && part.templateName) {
          return (
            <TemplateCard
              key={`${part.templateId}-${index}`}
              templateId={part.templateId}
              templateName={part.templateName}
              description={part.metadata?.description}
              isOwn={part.metadata?.is_own_template}
              isFavorite={part.metadata?.is_favorite}
              rating={part.metadata?.rating_average}
              downloads={part.metadata?.download_count}
            />
          )
        }

        return (
          <div
            key={`text-${index}`}
            className="prose prose-sm max-w-none prose-headings:text-[#111827] prose-headings:font-semibold prose-p:text-[#374151] prose-p:leading-relaxed prose-code:text-[#4f46e5] prose-code:bg-[#ede9fe] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-pre:bg-[#1f2937] prose-pre:text-[#f9fafb] prose-pre:text-xs"
          >
            <ReactMarkdown>{part.content}</ReactMarkdown>
          </div>
        )
      })}
    </div>
  )
}
