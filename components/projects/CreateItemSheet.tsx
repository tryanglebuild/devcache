'use client'

import { useState } from 'react'
import { Tables } from '@/types/database.types'
import { X, Folder, FileText, Upload, Paperclip } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

type ProjectItem = Tables<'project_items'>

interface CreateItemSheetProps {
  isOpen: boolean
  onClose: () => void
  type: 'folder' | 'file'
  parentId: string | null
  onItemCreated: (item: ProjectItem) => void
}

export function CreateItemSheet({
  isOpen,
  onClose,
  type,
  parentId,
  onItemCreated,
}: CreateItemSheetProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [languageTags, setLanguageTags] = useState('')
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

      const tags = languageTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      // Create project item
      const { data: item, error: itemError } = await supabase
        .from('project_items')
        .insert({
          user_id: user.id,
          parent_id: parentId,
          name: name.trim(),
          description: description.trim() || null,
          type,
          content: type === 'file' ? content : null,
          language_tags: tags.length > 0 ? tags : null,
        })
        .select()
        .single()

      if (itemError) throw itemError

      // Upload files if any
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
    setLanguageTags('')
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
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-2xl bg-white border-l border-[#c7c4d7]/20 p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#4f46e5] to-[#4338ca] px-8 py-8 shrink-0">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-xl">
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">Create New {type === 'folder' ? 'Folder' : 'File'}</div>
                <p className="text-sm font-medium text-white/80 mt-1">
                  {type === 'folder' ? 'Organize your projects' : 'Add markdown document'}
                </p>
              </div>
            </SheetTitle>
          </SheetHeader>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-8 bg-[#f7f9fb]">
          <form id="create-item-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-[#191c1e] mb-2">
                Name <span className="text-[#ba1a1a]">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={type === 'folder' ? 'My Project Folder' : 'my-document.md'}
                required
                className="w-full h-12 bg-white border-[#c7c4d7]/30 focus:border-[#4f46e5] focus:ring-[#4f46e5] placeholder:text-gray-400"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-[#191c1e] mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this item..."
                rows={3}
                className="w-full px-4 py-3 bg-white border border-[#c7c4d7]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] text-sm resize-none placeholder:text-gray-400"
              />
            </div>

            {/* Language Tags */}
            <div>
              <label className="block text-sm font-bold text-[#191c1e] mb-2">
                Language Tags
              </label>
              <Input
                value={languageTags}
                onChange={(e) => setLanguageTags(e.target.value)}
                placeholder="e.g., javascript, python, react"
                className="w-full h-12 bg-white border-[#c7c4d7]/30 focus:border-[#4f46e5] focus:ring-[#4f46e5] placeholder:text-gray-400"
              />
              <p className="text-xs text-[#464554] mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5]"></span>
                Separate multiple tags with commas
              </p>
            </div>

            {/* Content (only for files) */}
            {type === 'file' && (
              <div>
                <label className="block text-sm font-bold text-[#191c1e] mb-2">
                  Content (Markdown)
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="# My Document&#10;&#10;Start writing your markdown content here..."
                  rows={12}
                  className="w-full px-4 py-3 bg-white border border-[#c7c4d7]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] text-sm font-mono resize-none placeholder:text-gray-400"
                />
              </div>
            )}

            {/* File Upload */}
            <div>
              <label className="block text-sm font-bold text-[#191c1e] mb-3 flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                File Attachments
              </label>
              <div className="space-y-3">
                <label className="block">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.pdf,.txt,.md,.json,.zip,.csv,.xlsx,.xls"
                  />
                  <div className="px-6 py-4 bg-white border-2 border-dashed border-[#c7c4d7]/40 rounded-xl hover:border-[#4f46e5] hover:bg-[#4f46e5]/5 transition-all cursor-pointer group">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-12 h-12 rounded-full bg-[#f2f4f6] group-hover:bg-[#4f46e5]/10 flex items-center justify-center transition-colors">
                        <Upload className="h-5 w-5 text-[#464554] group-hover:text-[#4f46e5] transition-colors" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#191c1e]">
                          Choose Files to Upload
                        </p>
                        <p className="text-xs text-[#464554] mt-1">
                          or drag and drop files here
                        </p>
                      </div>
                    </div>
                  </div>
                </label>

                {files.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-[#464554]">
                      {files.length} file{files.length > 1 ? 's' : ''} selected
                    </p>
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#c7c4d7]/20 group hover:border-[#4f46e5]/30 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#4f46e5]/10 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-[#4f46e5]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#191c1e] truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-[#464554]">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-2 hover:bg-[#f2f4f6] rounded-lg transition-colors text-[#ba1a1a] opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-[#464554] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#904900]"></span>
                  Max 50MB per file. Multiple files allowed.
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Sticky Actions */}
        <div className="bg-white border-t border-[#c7c4d7]/20 px-8 py-6 shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 h-12 border-[#c7c4d7]/40 hover:bg-[#f2f4f6] font-semibold text-[#464554]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-item-form"
              disabled={isLoading || !name.trim()}
              className="flex-1 h-12 bg-gradient-to-br from-[#4f46e5] to-[#4338ca] hover:shadow-xl font-semibold text-white shadow-lg shadow-[#4f46e5]/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Creating...
                </span>
              ) : (
                `Create ${type === 'folder' ? 'Folder' : 'File'}`
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
