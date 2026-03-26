'use client'

import { useState, useEffect } from 'react'
import { Tables } from '@/types/database.types'
import { Edit, Folder, FileText } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

type ProjectItem = Tables<'project_items'>

interface EditItemDialogProps {
  isOpen: boolean
  onClose: () => void
  item: ProjectItem
  onItemUpdated: (item: ProjectItem) => void
}

export function EditItemDialog({
  isOpen,
  onClose,
  item,
  onItemUpdated,
}: EditItemDialogProps) {
  const [name, setName] = useState(item.name)
  const [description, setDescription] = useState(item.description || '')
  const [languageTags, setLanguageTags] = useState(
    item.language_tags?.join(', ') || ''
  )
  const [content, setContent] = useState(item.content || '')
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    setName(item.name)
    setDescription(item.description || '')
    setLanguageTags(item.language_tags?.join(', ') || '')
    setContent(item.content || '')
  }, [item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const tags = languageTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    const { data, error } = await supabase
      .from('project_items')
      .update({
        name,
        description: description || null,
        content: item.type === 'file' ? content : null,
        language_tags: tags.length > 0 ? tags : null,
      })
      .eq('id', item.id)
      .select()
      .single()

    setIsLoading(false)

    if (error) {
      toast.error('Failed to update item')
      return
    }

    toast.success('Item updated successfully')
    onItemUpdated(data)
    onClose()
  }

  const Icon = item.type === 'folder' ? Folder : FileText

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Icon className="h-6 w-6 text-[#4648d4]" />
            Edit {item.type === 'folder' ? 'Folder' : 'File'}
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
          </div>

          {/* Content (only for files) */}
          {item.type === 'file' && (
            <div>
              <label className="block text-sm font-bold text-[#191c1e] mb-2">
                Content (Markdown)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
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
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-br from-[#4648d4] to-[#6063ee]"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
