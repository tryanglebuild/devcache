'use client'

import { useState, useEffect } from 'react'
import { X, ExternalLink, FileText, Loader2, Download, File, Image as ImageIcon } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'

interface ResourcePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  resourceId: string
  resourceType: 'file' | 'folder' | 'template'
  resourceName: string
}

interface ResourceData {
  name: string
  description?: string
  content: string
  language?: string
  tags?: string[]
  project_name?: string
  resource_type?: 'file' | 'folder'
  has_attachments?: boolean
  attachment_count?: number
  attachments?: Array<{
    id: string
    file_name: string
    file_size: number
    mime_type: string
    file_path: string
  }>
  // Folder-specific fields
  item_count?: number
  file_count?: number
  folder_count?: number
  items?: Array<{
    id: string
    name: string
    type: 'file' | 'folder'
    description?: string
    created_at: string
  }>
}

export function ResourcePreviewModal({
  isOpen,
  onClose,
  resourceId,
  resourceType,
  resourceName,
}: ResourcePreviewModalProps) {
  const [data, setData] = useState<ResourceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Use unified resource API for files and folders
        const endpoint =
          resourceType === 'file' || resourceType === 'folder'
            ? `/api/chat/preview/resource/${resourceId}`
            : `/api/chat/preview/template/${resourceId}`

        const response = await fetch(endpoint)

        if (!response.ok) {
          throw new Error('Failed to load preview')
        }

        const result = await response.json()
        
        // If file has attachments, fetch their content automatically
        if (result.attachments && result.attachments.length > 0) {
          const attachmentsWithContent = await Promise.all(
            result.attachments.map(async (att: any) => {
              const isTextBased =
                att.mime_type.startsWith('text/') ||
                att.file_name.endsWith('.md') ||
                att.file_name.endsWith('.markdown') ||
                att.mime_type === 'application/json'

              if (isTextBased) {
                try {
                  const contentResponse = await fetch(`/api/chat/preview/attachment/${att.id}`)
                  if (contentResponse.ok) {
                    const contentData = await contentResponse.json()
                    return { ...att, content: contentData.content }
                  }
                } catch (err) {
                  console.error('Failed to load attachment content:', err)
                }
              }
              return att
            })
          )
          result.attachments = attachmentsWithContent
        }
        
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load preview')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isOpen, resourceId, resourceType])

  if (!isOpen) return null

  const handleViewFull = () => {
    if (resourceType === 'folder') {
      window.open(`/dashboard/projects/${resourceId}`, '_blank')
    } else if (resourceType === 'file') {
      window.open(`/dashboard/projects/file/${resourceId}`, '_blank')
    } else {
      window.open(`/marketplace/${resourceId}`, '_blank')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-container rounded-xl shadow-2xl dark:shadow-none dark:ring-1 dark:ring-white/[0.08] w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/[0.09]">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-surface-container-high rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-500 dark:text-on-surface-variant" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-on-surface truncate">
                {resourceName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-on-surface-variant">
                {resourceType === 'folder' 
                  ? 'Your Folder' 
                  : resourceType === 'file' 
                  ? 'Your File' 
                  : 'Marketplace Template'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleViewFull}
              className="p-2 text-gray-600 dark:text-on-surface-variant hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-on-surface-variant hover:text-gray-900 dark:hover:text-on-surface hover:bg-gray-100 dark:hover:bg-surface-container-high rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-gray-400 dark:text-on-surface-variant animate-spin" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4 text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {data && !loading && !error && (
            <div className="space-y-4">
              {/* Description */}
              {data.description && (
                <div className="bg-gray-50 dark:bg-surface-container-high rounded-lg p-4">
                  <p className="text-sm text-gray-700 dark:text-on-surface">{data.description}</p>
                </div>
              )}

              {/* Tags */}
              {data.tags && data.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 dark:bg-surface-container-high text-gray-700 dark:text-on-surface px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Content Preview */}
              <div className="border border-gray-200 dark:border-white/[0.09] rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-surface-container-high px-4 py-2 border-b border-gray-200 dark:border-white/[0.09]">
                  <p className="text-xs font-medium text-gray-600 dark:text-on-surface-variant">Preview</p>
                </div>
                
                {/* Text Content */}
                {data.content && (
                  <div className="p-4 bg-white dark:bg-surface-container max-h-[500px] overflow-y-auto">
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ children, className, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '')
                            const language = match ? match[1] : data.language || 'text'
                            const inline = !className

                            return !inline ? (
                              <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={language}
                                PreTag="div"
                                className="rounded-lg !my-2"
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
                        {data.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Attachments Preview */}
                {data.attachments && data.attachments.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-white/[0.09]">
                    <div className="bg-gray-50 dark:bg-surface-container-high px-4 py-2 border-b border-gray-200 dark:border-white/[0.09]">
                      <p className="text-xs font-medium text-gray-600 dark:text-on-surface-variant">
                        Attachments ({data.attachments.length})
                      </p>
                    </div>
                    <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                      {data.attachments.map((attachment) => (
                        <AttachmentPreview
                          key={attachment.id}
                          attachment={attachment}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-white/[0.09] bg-gray-50 dark:bg-surface-container-high">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-on-surface hover:bg-gray-200 dark:hover:bg-surface-container rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleViewFull}
            className="px-4 py-2 bg-gray-900 dark:bg-on-surface text-white dark:text-surface-container hover:bg-gray-700 dark:hover:bg-on-surface/90 rounded-lg transition-colors flex items-center gap-2"
          >
            Open Full View
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Attachment Preview Component
function AttachmentPreview({ attachment }: { attachment: any }) {
  const [expanded, setExpanded] = useState(true) // Start expanded if content is available
  
  const isImage = attachment.mime_type.startsWith('image/')
  const isPDF = attachment.mime_type === 'application/pdf'
  const isText = attachment.mime_type.startsWith('text/') || 
                 attachment.file_name.endsWith('.md') ||
                 attachment.file_name.endsWith('.markdown') ||
                 attachment.mime_type === 'application/json'
  
  const hasContent = attachment.content && attachment.content.length > 0
  
  const sizeKB = (attachment.file_size / 1024).toFixed(2)
  const sizeMB = attachment.file_size > 1024 * 1024 
    ? (attachment.file_size / (1024 * 1024)).toFixed(2) + ' MB'
    : sizeKB + ' KB'

  const handleDownload = () => {
    window.open(attachment.file_path, '_blank')
  }

  const handleToggleContent = () => {
    setExpanded(!expanded)
  }

  return (
    <div className="border border-gray-200 dark:border-white/[0.09] rounded-lg overflow-hidden hover:border-gray-400 dark:hover:border-white/[0.2] transition-colors">
      {/* Image Preview */}
      {isImage && (
        <div className="relative w-full bg-gray-100 dark:bg-surface-container-high">
          <img
            src={attachment.file_path}
            alt={attachment.file_name}
            className="w-full h-auto max-h-[300px] object-contain"
            loading="lazy"
          />
        </div>
      )}

      {/* PDF Preview */}
      {isPDF && (
        <div className="relative w-full h-[400px] bg-gray-100 dark:bg-surface-container-high">
          <iframe
            src={attachment.file_path}
            className="w-full h-full"
            title={attachment.file_name}
          />
        </div>
      )}

      {/* Text Content Preview */}
      {isText && hasContent && expanded && (
        <div className="p-4 bg-gray-50 dark:bg-surface-container-high max-h-[500px] overflow-y-auto border-b border-gray-200 dark:border-white/[0.09]">
          <div className="markdown-content text-sm text-gray-700 dark:text-on-surface">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ children, className, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '')
                  const language = match ? match[1] : 'text'
                  const inline = !className

                  return !inline ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={language}
                      PreTag="div"
                      className="rounded-lg my-4"
                      customStyle={{
                        margin: 0,
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                      }}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-gray-100 dark:bg-surface-container text-gray-700 dark:text-on-surface px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                      {children}
                    </code>
                  )
                },
                h1: ({ children }: any) => <h1 className="text-2xl font-bold text-gray-900 dark:text-on-surface mb-4 mt-6">{children}</h1>,
                h2: ({ children }: any) => <h2 className="text-xl font-semibold text-gray-900 dark:text-on-surface mb-3 mt-5">{children}</h2>,
                h3: ({ children }: any) => <h3 className="text-lg font-semibold text-gray-900 dark:text-on-surface mb-2 mt-4">{children}</h3>,
                p: ({ children }: any) => <p className="mb-3 leading-relaxed">{children}</p>,
                ul: ({ children }: any) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                ol: ({ children }: any) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                li: ({ children }: any) => <li className="text-gray-700 dark:text-on-surface">{children}</li>,
                a: ({ href, children }: any) => <a href={href} className="text-gray-700 dark:text-on-surface hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                blockquote: ({ children }: any) => <blockquote className="border-l-4 border-gray-300 dark:border-white/[0.2] pl-4 italic text-gray-600 dark:text-on-surface-variant my-3">{children}</blockquote>,
                strong: ({ children }: any) => <strong className="font-semibold text-gray-900 dark:text-on-surface">{children}</strong>,
              }}
            >
              {attachment.content}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* File Info */}
      <div className="p-3 bg-white dark:bg-surface-container flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {isImage ? (
              <ImageIcon className="w-5 h-5 text-gray-500 dark:text-on-surface-variant" />
            ) : (
              <File className="w-5 h-5 text-gray-600 dark:text-on-surface-variant" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-on-surface truncate">
              {attachment.file_name}
            </p>
            <p className="text-xs text-gray-500 dark:text-on-surface-variant">
              {attachment.mime_type} • {sizeMB}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isText && hasContent && (
            <button
              onClick={handleToggleContent}
              className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
            >
              {expanded ? 'Hide Content' : 'Show Content'}
            </button>
          )}
          <button
            onClick={handleDownload}
            className="flex-shrink-0 p-2 text-gray-600 dark:text-on-surface-variant hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
