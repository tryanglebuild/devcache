'use client'

import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import { TemplateCard } from './TemplateCard'
import { FileCard } from './FileCard'
import { FolderCard } from './FolderCard'

interface MessageContentProps {
  content: string
  templateMetadata?: Record<string, any>
}

interface ParsedContent {
  type: 'text' | 'template' | 'file' | 'folder'
  content: string
  resourceId?: string
  resourceName?: string
  metadata?: any
}

/**
 * Parse message content to extract template, file, and folder cards
 * Formats: 
 * - [TEMPLATE:template_id:template_name]
 * - [FILE:file_id:file_name]
 * - [FOLDER:folder_id:folder_name]
 */
function parseMessageContent(content: string, metadata?: Record<string, any>): ParsedContent[] {
  const parts: ParsedContent[] = []
  
  // Combined regex to match TEMPLATE, FILE, and FOLDER tags
  const resourceRegex = /\[(TEMPLATE|FILE|FOLDER):([^:]+):([^\]]+)\]/g
  
  let lastIndex = 0
  let match

  while ((match = resourceRegex.exec(content)) !== null) {
    // Add text before resource
    if (match.index > lastIndex) {
      const textContent = content.substring(lastIndex, match.index).trim()
      if (textContent) {
        parts.push({
          type: 'text',
          content: textContent,
        })
      }
    }

    // Add resource card
    const resourceType = match[1].toLowerCase() as 'template' | 'file' | 'folder'
    const resourceId = match[2]
    const resourceName = match[3]
    
    parts.push({
      type: resourceType,
      content: '',
      resourceId,
      resourceName,
      metadata: metadata?.[resourceId],
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

  // If no resources found, return original content as text
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
        // Render template card
        if (part.type === 'template' && part.resourceId && part.resourceName) {
          return (
            <TemplateCard
              key={`template-${part.resourceId}-${index}`}
              templateId={part.resourceId}
              templateName={part.resourceName}
              description={part.metadata?.description}
              isOwn={part.metadata?.is_own_template}
              isFavorite={part.metadata?.is_favorite}
              rating={part.metadata?.rating_average}
              downloads={part.metadata?.download_count}
            />
          )
        }

        // Render file card
        if (part.type === 'file' && part.resourceId && part.resourceName) {
          return (
            <FileCard
              key={`file-${part.resourceId}-${index}`}
              fileId={part.resourceId}
              fileName={part.resourceName}
              description={part.metadata?.description}
              projectName={part.metadata?.project_name}
            />
          )
        }

        // Render folder card
        if (part.type === 'folder' && part.resourceId && part.resourceName) {
          return (
            <FolderCard
              key={`folder-${part.resourceId}-${index}`}
              folderId={part.resourceId}
              folderName={part.resourceName}
              description={part.metadata?.description}
              itemCount={part.metadata?.item_count}
            />
          )
        }

        // Render markdown text
        return (
          <div
            key={`text-${index}`}
            className="prose prose-sm max-w-none 
              prose-headings:text-gray-900 dark:prose-headings:text-on-surface prose-headings:font-semibold prose-headings:mb-2
              prose-p:text-gray-700 dark:prose-p:text-on-surface prose-p:leading-relaxed prose-p:mb-3
              prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900 dark:prose-strong:text-on-surface prose-strong:font-semibold
              prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-blue-50 dark:prose-code:bg-blue-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:text-sm prose-pre:rounded-lg prose-pre:p-0 prose-pre:my-4
              prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-1 prose-ul:my-3
              prose-ol:list-decimal prose-ol:pl-5 prose-ol:space-y-1 prose-ol:my-3
              prose-li:text-gray-700 dark:prose-li:text-on-surface prose-li:my-1
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 dark:prose-blockquote:text-on-surface-variant
              prose-table:border-collapse prose-table:w-full
              prose-th:border prose-th:border-gray-300 dark:prose-th:border-white/[0.09] prose-th:bg-gray-50 dark:prose-th:bg-surface-container-high prose-th:p-2 prose-th:text-left
              prose-td:border prose-td:border-gray-300 dark:prose-td:border-white/[0.09] prose-td:p-2"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p({ children, ...props }) {
                  return <p {...props}>{children}</p>
                },
                code({ children, className, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '')
                  const language = match ? match[1] : ''
                  const inline = !className
                  
                  return !inline && language ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={language}
                      PreTag="div"
                      className="rounded-lg !my-4"
                      customStyle={{
                        margin: 0,
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                      }}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                },
              }}
            >
              {part.content}
            </ReactMarkdown>
          </div>
        )
      })}
    </div>
  )
}
