'use client'

import { useState } from 'react'
import { Tables } from '@/types/database.types'
import { Folder, FileText, Upload, X, Paperclip } from 'lucide-react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { createClient } from '@/lib/supabase/client'
import { TagSelector } from './TagSelector'
import toast from 'react-hot-toast'

type ProjectItem = Tables<'project_items'>

interface CreateItemModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'folder' | 'file'
  parentId: string | null
  onItemCreated: (item: ProjectItem) => void
}

export function CreateItemModal({ isOpen, onClose, type, parentId, onItemCreated }: CreateItemModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast.error('Name is required'); return }
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('You must be logged in'); return }

      const { data: item, error: itemError } = await supabase
        .from('project_items')
        .insert({
          user_id: user.id,
          parent_id: parentId,
          name: name.trim(),
          description: description.trim() || null,
          type,
          content: type === 'file' ? content : null,
          language_tags: selectedTags.length > 0 ? selectedTags : null,
        })
        .select().single()

      if (itemError) throw itemError

      if (files.length > 0 && item) {
        const uploadPromises = files.map(async (file) => {
          const filePath = `${user.id}/${item.id}/${Date.now()}-${file.name}`
          const { error: uploadError } = await supabase.storage.from('project-files').upload(filePath, file)
          if (uploadError) throw uploadError
          const { error: dbError } = await supabase.from('project_file_attachments').insert({
            project_item_id: item.id, user_id: user.id, file_name: file.name,
            file_path: filePath, file_size: file.size, mime_type: file.type,
          })
          if (dbError) throw dbError
        })
        await Promise.all(uploadPromises)
      }

      toast.success(`${type === 'folder' ? 'Folder' : 'File'} created`)
      onItemCreated(item)
      handleClose()
    } catch {
      toast.error('Failed to create item')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setName(''); setDescription(''); setSelectedTags([]); setContent(''); setFiles([])
    onClose()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files)
      setFiles(fileList)
      if (!name.trim() && fileList.length > 0 && type === 'file') setName(fileList[0].name)
    }
  }

  const Icon = type === 'folder' ? Folder : FileText

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalHeader
          icon={
            <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-surface-container-high flex items-center justify-center">
              <Icon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" strokeWidth={1.5} />
            </div>
          }
          subtitle={type === 'folder' ? 'Organize your projects' : 'Add a markdown document'}
        >
          New {type === 'folder' ? 'Folder' : 'File'}
        </ModalHeader>

        <ModalBody className="space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'folder' ? 'My Project Folder' : 'my-document.md'}
              required
              className="w-full px-3 py-2.5 bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-lg focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 outline-none text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              rows={2}
              className="w-full px-3 py-2.5 bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-lg focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 outline-none text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 resize-none transition-colors"
            />
          </div>

          {/* Language Tags */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Language Tags
            </label>
            <TagSelector selectedTags={selectedTags} onTagsChange={setSelectedTags} />
          </div>

          {/* Content (files only) */}
          {type === 'file' && (
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Content (Markdown)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={'# My Document\n\nStart writing...'}
                rows={6}
                className="w-full px-3 py-2.5 bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-lg focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 outline-none text-sm font-mono text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 resize-none transition-colors"
              />
            </div>
          )}

          {/* File Attachments */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Paperclip className="h-3.5 w-3.5" />
              Attachments
            </label>
            <label className="block cursor-pointer">
              <input type="file" multiple onChange={handleFileChange} className="hidden" />
              <div className="px-4 py-5 border border-dashed border-neutral-300 dark:border-white/[0.12] rounded-lg hover:border-neutral-500 dark:hover:border-white/25 hover:bg-neutral-50 dark:hover:bg-surface-container-high transition-all text-center">
                <Upload className="h-5 w-5 text-neutral-400 dark:text-neutral-500 mx-auto mb-1.5" strokeWidth={1.5} />
                <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Click to choose files</p>
              </div>
            </label>

            {files.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 px-3 py-2 bg-neutral-50 dark:bg-surface-container-high border border-neutral-200 dark:border-white/[0.09] rounded-lg">
                    <FileText className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" strokeWidth={1.5} />
                    <span className="text-xs text-neutral-700 dark:text-neutral-300 flex-1 truncate">{file.name}</span>
                    <button type="button" onClick={() => setFiles(files.filter((_, i) => i !== index))} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-md text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-surface-container-high disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-md text-sm font-medium hover:bg-neutral-700 dark:hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isLoading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isLoading ? 'Creating...' : 'Create'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
