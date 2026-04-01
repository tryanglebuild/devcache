'use client'

import { useState, useEffect } from 'react'
import { Tables } from '@/types/database.types'
import { Tag as TagIcon, FileText, Folder, X, ExternalLink } from 'lucide-react'
import { Modal, ModalHeader, ModalBody } from '@/components/ui/modal'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

type LanguageTag = Tables<'language_tags'>
type ProjectItem = Tables<'project_items'>

interface TagDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  tag: LanguageTag
  fileCount: number
}

export function TagDetailsModal({ isOpen, onClose, tag, fileCount }: TagDetailsModalProps) {
  const [files, setFiles] = useState<ProjectItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      loadFiles()
    }
  }, [isOpen, tag.name])

  const loadFiles = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('project_items')
        .select('*')
        .contains('language_tags', [tag.name])
        .order('updated_at', { ascending: false })

      if (error) throw error
      setFiles(data || [])
    } catch (error) {
      console.error('Error loading files:', error)
      toast.error('Failed to load files')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileClick = (file: ProjectItem) => {
    if (file.type === 'file') {
      router.push(`/dashboard/projects/file/${file.id}`)
    } else {
      router.push(`/dashboard/projects/${file.id}`)
    }
    onClose()
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalHeader
        icon={
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: tag.color }}
          >
            <TagIcon className="h-5 w-5" />
          </div>
        }
        subtitle={tag.description || 'View all files with this tag'}
      >
        {tag.name}
      </ModalHeader>

      <ModalBody className="max-h-[600px] overflow-y-auto">
        {/* Stats */}
        <div className="bg-gradient-to-br from-[#f8f9fa] to-[#f2f4f6] p-4 rounded-xl mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#464554] uppercase tracking-wider">
                Total Files
              </p>
              <p className="text-2xl font-black text-[#191c1e]">{fileCount}</p>
            </div>
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-lg"
              style={{ 
                backgroundColor: tag.color,
                boxShadow: `0 4px 14px ${tag.color}40`
              }}
            >
              <TagIcon className="h-8 w-8" />
            </div>
          </div>
        </div>

        {/* Files List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-[#f2f4f6] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f2f4f6] flex items-center justify-center">
              <FileText className="h-8 w-8 text-[#464554]" />
            </div>
            <p className="text-[#464554] font-medium">No files found with this tag</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <button
                key={file.id}
                onClick={() => handleFileClick(file)}
                className="w-full p-4 bg-white hover:bg-[#f8f9fa] border border-[#c7c4d7]/20 rounded-lg transition-all group text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#f2f4f6] flex items-center justify-center flex-shrink-0 group-hover:bg-[#4648d4]/10 transition-colors">
                    {file.type === 'folder' ? (
                      <Folder className="h-5 w-5 text-[#4648d4]" />
                    ) : (
                      <FileText className="h-5 w-5 text-[#4648d4]" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-[#191c1e] truncate">
                        {file.name}
                      </h4>
                      <ExternalLink className="h-3.5 w-3.5 text-[#464554] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                    
                    {file.description && (
                      <p className="text-xs text-[#464554] line-clamp-2 mb-2">
                        {file.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-3 text-xs text-[#464554]">
                      <span className="capitalize">{file.type}</span>
                      <span>•</span>
                      <span>Updated {formatDate(file.updated_at || file.created_at || '')}</span>
                    </div>
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
