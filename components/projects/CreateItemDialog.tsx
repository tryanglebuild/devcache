'use client'

import { useState } from 'react'
import { Tables } from '@/types/database.types'
import { X, Folder, FileText } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

type ProjectItem = Tables<'project_items'>

interface CreateItemDialogProps {
  isOpen: boolean
  onClose: () => void
  type: 'folder' | 'file'
  parentId: string | null
  onItemCreated: (item: ProjectItem) => void
}

export function CreateItemDialog({
  isOpen,
  onClose,
  type,
  parentId,
  onItemCreated,
}: CreateItemDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [languageTags, setLanguageTags] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('You must be logged in')
      setIsLoading(false)
      return
    }

    const tags = languageTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    const { data, error } = await supabase
      .from('project_items')
      .insert({
        user_id: user.id,
        parent_id: parentId,
        name,
        description: description || null,
        type,
        content: type === 'file' ? content : null,
        language_tags: tags.length > 0 ? tags : null,
      })
      .select()
      .single()

    setIsLoading(false)

    if (error) {
      toast.error('Failed to create item')
      return
    }

    toast.success(`${type === 'folder' ? 'Folder' : 'File'} created successfully`)
    onItemCreated(data)
    handleClose()
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    setLanguageTags('')
    setContent('')
    onClose()
  }

  const Icon = type === 'folder' ? Folder : FileText

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Icon className="h-6 w-6 text-[#4648d4]" />
            Create New {type === 'folder' ? 'Folder' : 'File'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-[#191c1e] mb-2">
              Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'folder' ? 'My Project Folder' : 'my-document.md'}
              required
              className="w-full"
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
              className="w-full px-3 py-2 border border-[#c7c4d7]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4648d4] text-sm"
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
              placeholder="typescript, react, nextjs (comma-separated)"
              className="w-full"
            />
            <p className="text-xs text-[#464554] mt-1">
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
                className="w-full px-3 py-2 border border-[#c7c4d7]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4648d4] text-sm font-mono"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-[#c7c4d7]/20">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-br from-[#4648d4] to-[#6063ee]"
            >
              {isLoading ? 'Creating...' : `Create ${type === 'folder' ? 'Folder' : 'File'}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
