'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tables } from '@/types/database.types'
import { FileText, Code, Eye, Edit, Trash2, Download, Paperclip, Copy, Check, Upload } from 'lucide-react'
import { EditItemModal } from './EditItemModal'
import { PublishToMarketplaceModal } from './PublishToMarketplaceModal'
import { Breadcrumb } from './Breadcrumb'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { createClient } from '@/lib/supabase/client'
import { trackActivity } from '@/lib/activity/track'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import { MarkdownCodeBlock } from './MarkdownCodeBlock'

type ProjectItem = Tables<'project_items'>
type FileAttachment = Tables<'project_file_attachments'>

interface FileViewClientProps {
  file: ProjectItem
  attachments: FileAttachment[]
}

export function FileViewClient({ file, attachments: initialAttachments }: FileViewClientProps) {
  const router = useRouter()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'rendered' | 'source'>('rendered')
  const [attachments, setAttachments] = useState(initialAttachments)
  const [attachmentContent, setAttachmentContent] = useState<string>('')
  const [isLoadingContent, setIsLoadingContent] = useState(false)
  const [tagColors, setTagColors] = useState<Record<string, string>>({})
  const [breadcrumbPath, setBreadcrumbPath] = useState<ProjectItem[]>([])
  const [copied, setCopied] = useState(false)
  const [deleteFileConfirmOpen, setDeleteFileConfirmOpen] = useState(false)
  const [deleteAttachmentTarget, setDeleteAttachmentTarget] = useState<string | null>(null)

  const supabase = createClient()

  const handleCopyContent = async () => {
    const content = file.content || attachmentContent
    if (!content) {
      toast.error('No content to copy')
      return
    }

    try {
      let textToCopy = content

      // If in rendered mode, strip markdown formatting
      if (viewMode === 'rendered') {
        // Remove markdown syntax for plain text
        textToCopy = content
          // Remove headers
          .replace(/^#{1,6}\s+/gm, '')
          // Remove bold/italic
          .replace(/(\*\*|__)(.*?)\1/g, '$2')
          .replace(/(\*|_)(.*?)\1/g, '$2')
          // Remove links but keep text
          .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
          // Remove inline code backticks
          .replace(/`([^`]+)`/g, '$1')
          // Remove code block markers
          .replace(/```[\s\S]*?```/g, (match) => {
            return match.replace(/```\w*\n?/g, '').replace(/```$/g, '')
          })
          // Remove blockquotes
          .replace(/^>\s+/gm, '')
          // Remove horizontal rules
          .replace(/^(-{3,}|_{3,}|\*{3,})$/gm, '')
          // Remove list markers
          .replace(/^[\s]*[-*+]\s+/gm, '')
          .replace(/^[\s]*\d+\.\s+/gm, '')
          // Clean up extra whitespace
          .replace(/\n{3,}/g, '\n\n')
          .trim()
      }
      // If in source mode, copy raw markdown

      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      toast.success(viewMode === 'rendered' ? 'Plain text copied' : 'Markdown copied')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy error:', error)
      toast.error('Failed to copy content')
    }
  }

  // Load breadcrumb path
  useEffect(() => {
    trackActivity(file.id, 'view')
  }, [file.id])

  // Load breadcrumb path
  useEffect(() => {
    const loadBreadcrumbPath = async () => {
      if (!file.parent_id) {
        setBreadcrumbPath([])
        return
      }

      const { data, error } = await supabase.rpc('get_item_path', {
        item_id: file.parent_id
      })

      if (!error && data) {
        setBreadcrumbPath(data)
      }
    }

    loadBreadcrumbPath()
  }, [file.parent_id, supabase])

  // Load tag colors
  useEffect(() => {
    const loadTagColors = async () => {
      if (!file.language_tags || file.language_tags.length === 0) return

      const { data, error } = await supabase
        .from('user_tags')
        .select('name, color')
        .in('name', file.language_tags)

      if (!error && data) {
        const colors: Record<string, string> = {}
        data.forEach(tag => {
          colors[tag.name] = tag.color
        })
        setTagColors(colors)
      }
    }

    loadTagColors()
  }, [file.language_tags, supabase])

  // Load content from first attachment if no content in file
  useEffect(() => {
    const loadAttachmentContent = async () => {
      if (file.content || attachments.length === 0) return

      const firstAttachment = attachments[0]
      // Only load text-based files
      if (!firstAttachment.mime_type?.includes('text') && 
          !firstAttachment.file_name.endsWith('.md') &&
          !firstAttachment.file_name.endsWith('.txt') &&
          !firstAttachment.file_name.endsWith('.html')) {
        return
      }

      setIsLoadingContent(true)
      try {
        const { data, error } = await supabase.storage
          .from('project-files')
          .download(firstAttachment.file_path)

        if (error) throw error

        const text = await data.text()
        setAttachmentContent(text)
      } catch (error) {
        console.error('Error loading attachment content:', error)
      } finally {
        setIsLoadingContent(false)
      }
    }

    loadAttachmentContent()
  }, [file.content, attachments, supabase.storage])

  const handleDelete = () => {
    setDeleteFileConfirmOpen(true)
  }

  const confirmDeleteFile = async () => {
    setDeleteFileConfirmOpen(false)
    try {
      const { error } = await supabase
        .from('project_items')
        .delete()
        .eq('id', file.id)

      if (error) throw error

      // Notify sidebar to remove item immediately (before Realtime catches up)
      window.dispatchEvent(new CustomEvent('project-item-deleted', { detail: { id: file.id } }))
      toast.success('File deleted successfully')
      router.push('/dashboard/projects')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete file')
    }
  }

  const handleDownloadAttachment = async (attachment: FileAttachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('project-files')
        .download(attachment.file_path)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = attachment.file_name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('File downloaded')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download file')
    }
  }

  const handleDeleteAttachment = (attachmentId: string) => {
    setDeleteAttachmentTarget(attachmentId)
  }

  const confirmDeleteAttachment = async () => {
    if (!deleteAttachmentTarget) return
    const attachmentId = deleteAttachmentTarget
    setDeleteAttachmentTarget(null)

    try {
      const attachment = attachments.find(a => a.id === attachmentId)
      if (!attachment) return

      const { error: storageError } = await supabase.storage
        .from('project-files')
        .remove([attachment.file_path])

      if (storageError) throw storageError

      const { error: dbError } = await supabase
        .from('project_file_attachments')
        .delete()
        .eq('id', attachmentId)

      if (dbError) throw dbError

      setAttachments(attachments.filter(a => a.id !== attachmentId))
      toast.success('Attachment deleted')
    } catch (error) {
      console.error('Delete attachment error:', error)
      toast.error('Failed to delete attachment')
    }
  }

  const handleItemUpdated = (updatedItem: ProjectItem) => {
    router.refresh()
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbPath} currentPage={file.name} />

      {/* Header */}
      <div className="bg-white p-8 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)]">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#575992] to-[#4338ca] flex items-center justify-center text-white shadow-lg">
              <FileText className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-black tracking-tight text-[#191c1e] mb-2">
                {file.name}
              </h1>
              {file.description && (
                <p className="text-[#464554] font-medium">
                  {file.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {/* Publish Button */}
            {(file.content || attachmentContent) && (
              <button
                onClick={() => setIsPublishModalOpen(true)}
                className="p-2.5 bg-gradient-to-br from-[#4f46e5] to-[#4338ca] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 px-4"
                title="Publish to Marketplace"
              >
                <Upload className="h-4 w-4" />
                <span className="text-sm font-bold">Publish</span>
              </button>
            )}
            {/* Download Button - only show if there are attachments */}
            {attachments.length > 0 && (
              <button
                onClick={() => handleDownloadAttachment(attachments[0])}
                className="p-2.5 bg-white border border-[#c7c4d7]/30 text-[#191c1e] rounded-lg hover:bg-[#f2f4f6] transition-all"
                title="Download file"
              >
                <Download className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-2.5 bg-white border border-[#c7c4d7]/30 text-[#191c1e] rounded-lg hover:bg-[#f2f4f6] transition-all"
              title="Edit file"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2.5 bg-white border border-[#ba1a1a]/30 text-[#ba1a1a] rounded-lg hover:bg-[#ba1a1a]/10 transition-all"
              title="Delete file"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tags */}
        {file.language_tags && file.language_tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {file.language_tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white shadow-md"
                style={{ backgroundColor: tagColors[tag] || '#4f46e5' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2 bg-white p-2 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] w-fit">
        <button
          onClick={() => setViewMode('rendered')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            viewMode === 'rendered'
              ? 'bg-gradient-to-br from-[#4f46e5] to-[#4338ca] text-white shadow-lg'
              : 'text-[#464554] hover:bg-[#f2f4f6]'
          }`}
        >
          <Eye className="h-4 w-4" />
          Rendered
        </button>
        <button
          onClick={() => setViewMode('source')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            viewMode === 'source'
              ? 'bg-gradient-to-br from-[#4f46e5] to-[#4338ca] text-white shadow-lg'
              : 'text-[#464554] hover:bg-[#f2f4f6]'
          }`}
        >
          <Code className="h-4 w-4" />
          Source
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] overflow-hidden">
        {/* Copy Button - Positioned at top of content */}
        <div className="flex justify-end px-6 pt-6 pb-2 border-b border-[#c7c4d7]/20">
          <button
            onClick={handleCopyContent}
            className="p-2.5 bg-white border border-[#c7c4d7]/30 text-[#191c1e] rounded-lg hover:bg-[#f2f4f6] transition-all"
            title={viewMode === 'rendered' ? 'Copy as plain text' : 'Copy markdown source'}
          >
            {copied ? (
              <Check className="h-4 w-4 text-[#16a34a]" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="p-8">
          {isLoadingContent ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-[#4f46e5] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-[#464554]">Loading content...</p>
            </div>
          ) : viewMode === 'rendered' ? (
            <div className="prose prose-slate max-w-none">
              {file.content || attachmentContent ? (
                <ReactMarkdown
                  components={{
                    code({ node, className, children, ...props }) {
                      const content = String(children).replace(/\n$/, '')
                      
                      // Check if it's inline code by checking if there's a parent <pre> tag
                      const isInline = !className?.startsWith('language-')
                      
                      // Inline code
                      if (isInline) {
                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        )
                      }
                      
                      // Code block with copy button
                      return (
                        <MarkdownCodeBlock className={className}>
                          {content}
                        </MarkdownCodeBlock>
                      )
                    },
                  }}
                >
                  {file.content || attachmentContent}
                </ReactMarkdown>
              ) : (
                <div className="text-center py-12 text-[#464554]">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No content available</p>
                  {attachments.length > 0 && (
                    <p className="text-sm mt-2">
                      The attached file format is not supported for preview
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-6 rounded-lg overflow-x-auto">
                <code>{file.content || attachmentContent || '// No content'}</code>
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {file.notes && (
        <div className="bg-gradient-to-br from-[#904900]/5 to-[#904900]/10 p-8 rounded-xl border-2 border-[#904900]/20">
          <h2 className="text-xl font-black text-[#191c1e] mb-4 flex items-center gap-2">
            <Edit className="h-5 w-5 text-[#904900]" />
            Notes
          </h2>
          <div className="bg-white p-6 rounded-lg">
            <p className="text-[#191c1e] whitespace-pre-wrap leading-relaxed">
              {file.notes}
            </p>
          </div>
        </div>
      )}

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="bg-white p-8 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)]">
          <h2 className="text-xl font-black text-[#191c1e] mb-4 flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Attachments ({attachments.length})
          </h2>
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-4 bg-[#f2f4f6] rounded-lg hover:bg-[#e8eaed] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                    <FileText className="h-5 w-5 text-[#4f46e5]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#191c1e]">{attachment.file_name}</p>
                    <p className="text-xs text-[#464554]">
                      {(attachment.file_size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadAttachment(attachment)}
                    className="p-2 hover:bg-white rounded-lg transition-colors text-[#4f46e5]"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAttachment(attachment.id)}
                    className="p-2 hover:bg-white rounded-lg transition-colors text-[#ba1a1a]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        item={file}
        onItemUpdated={handleItemUpdated}
      />

      {/* Publish to Marketplace Modal */}
      <PublishToMarketplaceModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        projectItem={{
          id: file.id,
          name: file.name,
          description: file.description,
          content: file.content || attachmentContent,
          language_tags: file.language_tags
        }}
        onSuccess={() => {
          toast.success('Template published successfully!')
          router.push('/marketplace')
        }}
      />

      <ConfirmDialog
        isOpen={deleteFileConfirmOpen}
        onCancel={() => setDeleteFileConfirmOpen(false)}
        onConfirm={confirmDeleteFile}
        title={`Delete "${file.name}"?`}
        description="This file will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete"
      />

      <ConfirmDialog
        isOpen={!!deleteAttachmentTarget}
        onCancel={() => setDeleteAttachmentTarget(null)}
        onConfirm={confirmDeleteAttachment}
        title="Delete attachment?"
        description="This attachment will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
