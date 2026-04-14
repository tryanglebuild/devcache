'use client'

import { useState, useEffect } from 'react'
import { Tables } from '@/types/database.types'
import { Tag as TagIcon, FileText, Folder, ExternalLink } from 'lucide-react'
import { Modal, ModalHeader, ModalBody } from '@/components/ui/modal'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

type UserTag = Tables<'user_tags'>
type ProjectItem = Tables<'project_items'>

interface TagDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  tag: UserTag
  fileCount: number
}

export function TagDetailsModal({ isOpen, onClose, tag, fileCount }: TagDetailsModalProps) {
  const [files, setFiles] = useState<ProjectItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (isOpen) loadFiles()
  }, [isOpen, tag.name])

  const loadFiles = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('project_items')
        .select('*')
        .contains('language_tags', [tag.name])
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
      if (error) throw error
      setFiles(data || [])
    } catch {
      toast.error('Failed to load files')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileClick = (file: ProjectItem) => {
    router.push(
      file.type === 'file'
        ? `/dashboard/projects/file/${file.id}`
        : `/dashboard/projects/${file.id}`
    )
    onClose()
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader
        icon={
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center text-white"
            style={{ backgroundColor: tag.color }}
          >
            <TagIcon className="h-4 w-4" />
          </div>
        }
        subtitle="View all files with this tag"
      >
        {tag.name}
      </ModalHeader>

      <ModalBody className="max-h-[520px] overflow-y-auto">
        {/* Stat */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-surface-container-high border border-neutral-200 dark:border-white/[0.09] rounded-lg mb-4">
          <div>
            <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-0.5">
              Total Files
            </p>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
              {fileCount}
            </p>
          </div>
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: tag.color }}
          >
            <TagIcon className="h-4.5 w-4.5" size={18} />
          </div>
        </div>

        {/* Files */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-neutral-100 dark:bg-surface-container-high rounded-lg animate-pulse" />
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-10">
            <FileText size={20} strokeWidth={1.5} className="mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">No files yet</p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              No files have been tagged with <span className="font-medium">{tag.name}</span>
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {files.map((file) => (
              <button
                key={file.id}
                onClick={() => handleFileClick(file)}
                className="w-full px-3 py-3 bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-lg hover:border-neutral-400 dark:hover:border-white/20 hover:shadow-sm transition-all group text-left flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-surface-container-high flex items-center justify-center shrink-0 mt-0.5">
                  {file.type === 'folder'
                    ? <Folder size={15} strokeWidth={1.5} className="text-neutral-500 dark:text-neutral-400" />
                    : <FileText size={15} strokeWidth={1.5} className="text-neutral-500 dark:text-neutral-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                      {file.name}
                    </span>
                    <ExternalLink size={11} className="text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                  {file.description && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mb-1">
                      {file.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 dark:text-neutral-500">
                    <span className="capitalize">{file.type}</span>
                    <span>·</span>
                    <span>Updated {formatDate(file.updated_at || file.created_at || '')}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ModalBody>
    </Modal>
  )
}
