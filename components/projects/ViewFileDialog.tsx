'use client'

import { useState, useEffect } from 'react'
import { Tables } from '@/types/database.types'
import { FileText, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import ReactMarkdown from 'react-markdown'
import { FileUploadSection } from './FileUploadSection'

type ProjectItem = Tables<'project_items'>
type FileAttachment = Tables<'project_file_attachments'>

interface ViewFileDialogProps {
  isOpen: boolean
  onClose: () => void
  item: ProjectItem
}

export function ViewFileDialog({ isOpen, onClose, item }: ViewFileDialogProps) {
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      loadAttachments()
    }
  }, [isOpen, item.id])

  const loadAttachments = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('project_file_attachments')
      .select('*')
      .eq('project_item_id', item.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setAttachments(data)
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FileText className="h-6 w-6 text-[#4648d4]" />
            {item.name}
          </DialogTitle>
          <DialogDescription className="text-[#464554]">
            View and manage file content and attachments
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Description */}
          {item.description && (
            <div className="p-4 bg-[#f2f4f6] rounded-lg">
              <p className="text-sm text-[#464554]">{item.description}</p>
            </div>
          )}

          {/* Language Tags */}
          {item.language_tags && item.language_tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.language_tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-[#4648d4]/10 text-[#4648d4] rounded-lg text-xs font-bold uppercase tracking-wider"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="prose prose-sm max-w-none">
            {item.content ? (
              <div className="p-6 bg-white border border-[#c7c4d7]/20 rounded-lg">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-black text-[#191c1e] mb-4 mt-6 first:mt-0">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-bold text-[#191c1e] mb-3 mt-5">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-bold text-[#191c1e] mb-2 mt-4">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-[#464554] mb-4 leading-relaxed">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-4 space-y-1 text-[#464554]">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside mb-4 space-y-1 text-[#464554]">
                        {children}
                      </ol>
                    ),
                    code: ({ children, className }) => {
                      const isInline = !className
                      return isInline ? (
                        <code className="px-1.5 py-0.5 bg-[#f2f4f6] text-[#4648d4] rounded text-sm font-mono">
                          {children}
                        </code>
                      ) : (
                        <code className="block p-4 bg-[#191c1e] text-[#f2f4f6] rounded-lg overflow-x-auto text-sm font-mono">
                          {children}
                        </code>
                      )
                    },
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-[#4648d4] pl-4 italic text-[#464554] my-4">
                        {children}
                      </blockquote>
                    ),
                    a: ({ children, href }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#4648d4] hover:underline"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {item.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-12 text-[#464554]">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No content available</p>
              </div>
            )}
          </div>

          {/* File Attachments */}
          <div>
            <h3 className="text-lg font-bold text-[#191c1e] mb-3">File Attachments</h3>
            <FileUploadSection
              projectItemId={item.id}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
