'use client'

import { useState } from 'react'
import { Tables } from '@/types/database.types'
import { Folder, FileText, Upload, X, Paperclip } from 'lucide-react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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

export function CreateItemModal({
  isOpen,
  onClose,
  type,
  parentId,
  onItemCreated,
}: CreateItemModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }

    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in')
        return
      }

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
        .select()
        .single()

      if (itemError) throw itemError

      if (files.length > 0 && item) {
        const uploadPromises = files.map(async (file) => {
          const filePath = `${user.id}/${item.id}/${Date.now()}-${file.name}`
          
          const { error: uploadError } = await supabase.storage
            .from('project-files')
            .upload(filePath, file)

          if (uploadError) throw uploadError

          const { error: dbError } = await supabase
            .from('project_file_attachments')
            .insert({
              project_item_id: item.id,
              user_id: user.id,
              file_name: file.name,
              file_path: filePath,
              file_size: file.size,
              mime_type: file.type,
            })

          if (dbError) throw dbError
        })

        await Promise.all(uploadPromises)
      }

      toast.success(`${type === 'folder' ? 'Folder' : 'File'} created successfully`)
      onItemCreated(item)
      handleClose()
    } catch (error) {
      console.error('Create error:', error)
      toast.error('Failed to create item')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    setSelectedTags([])
    setContent('')
    setFiles([])
    onClose()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files)
      setFiles(fileList)
      
      // Auto-fill name with first file name if name is empty
      if (!name.trim() && fileList.length > 0 && type === 'file') {
        setName(fileList[0].name)
      }
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const Icon = type === 'folder' ? Folder : FileText

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalHeader
          icon={<Icon className="h-7 w-7" />}
          subtitle={type === 'folder' ? 'Organize your projects' : 'Add markdown document'}
        >
          Create New {type === 'folder' ? 'Folder' : 'File'}
        </ModalHeader>

        <ModalBody className="space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-[#191c1e] mb-2 uppercase tracking-wider">
              Name <span className="text-[#ba1a1a]">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'folder' ? 'My Project Folder' : 'my-document.md'}
              required
              className="h-12 placeholder:text-gray-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#191c1e] mb-2 uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              rows={3}
              className="w-full px-4 py-3 border border-[#c7c4d7]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4648d4] text-sm resize-none"
            />
          </div>

          {/* Language Tags */}
          <div>
            <label className="block text-xs font-bold text-[#191c1e] mb-2 uppercase tracking-wider">
              Language Tags
            </label>
            <TagSelector
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
            />
          </div>

          {/* Content (files only) */}
          {type === 'file' && (
            <div>
              <label className="block text-xs font-bold text-[#191c1e] mb-2 uppercase tracking-wider">
                Content (Markdown)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="# My Document&#10;&#10;Start writing..."
                rows={8}
                className="w-full px-4 py-3 border border-[#c7c4d7]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4648d4] text-sm font-mono resize-none"
              />
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-xs font-bold text-[#191c1e] mb-3 uppercase tracking-wider">
              <Paperclip className="inline h-3.5 w-3.5 mr-1" />
              File Attachments
            </label>
            <label className="block">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="px-6 py-4 border-2 border-dashed border-[#c7c4d7]/40 rounded-xl hover:border-[#4648d4] hover:bg-[#4648d4]/5 transition-all cursor-pointer group">
                <div className="flex flex-col items-center gap-2 text-center">
                  <Upload className="h-8 w-8 text-[#464554] group-hover:text-[#4648d4]" />
                  <p className="font-bold text-sm">Choose Files</p>
                </div>
              </div>
            </label>

            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-[#f2f4f6] rounded-lg">
                    <FileText className="h-4 w-4 text-[#4648d4]" />
                    <span className="text-sm flex-1 truncate">{file.name}</span>
                    <button type="button" onClick={() => removeFile(index)}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="flex-1 bg-gradient-to-br from-[#4648d4] to-[#6063ee]"
          >
            {isLoading ? 'Creating...' : 'Create'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
