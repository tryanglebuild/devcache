'use client'

import { useState, useEffect } from 'react'
import { Tables } from '@/types/database.types'
import { Edit, Folder, FileText } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TagSelector } from './TagSelector'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

type ProjectItem = Tables<'project_items'>

interface EditItemSheetProps {
  isOpen: boolean
  onClose: () => void
  item: ProjectItem
  onItemUpdated: (item: ProjectItem) => void
}

export function EditItemSheet({
  isOpen,
  onClose,
  item,
  onItemUpdated,
}: EditItemSheetProps) {
  const [name, setName] = useState(item.name)
  const [description, setDescription] = useState(item.description || '')
  const [selectedTags, setSelectedTags] = useState<string[]>(item.language_tags || [])
  const [notes, setNotes] = useState(item.notes || '')
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    setName(item.name)
    setDescription(item.description || '')
    setSelectedTags(item.language_tags || [])
    setNotes(item.notes || '')
  }, [item, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }

    setIsLoading(true)

    const { data, error } = await supabase
      .from('project_items')
      .update({
        name: name.trim(),
        description: description.trim() || null,
        language_tags: selectedTags.length > 0 ? selectedTags : null,
        notes: notes.trim() || null,
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-3xl bg-white border-l border-[#c7c4d7]/20 p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#4648d4] to-[#6063ee] px-8 py-8 shrink-0">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-xl">
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">Edit {item.type === 'folder' ? 'Folder' : 'File'}</div>
                <p className="text-sm font-medium text-white/80 mt-1">
                  Update your {item.type === 'folder' ? 'folder' : 'document'} details
                </p>
              </div>
            </SheetTitle>
          </SheetHeader>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-8 bg-[#f7f9fb]">
          <form id="edit-item-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-[#191c1e] mb-2">
                Name <span className="text-[#ba1a1a]">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter name..."
                className="w-full h-12 bg-white border-[#c7c4d7]/30 focus:border-[#4648d4] focus:ring-[#4648d4] placeholder:text-gray-400"
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
                className="w-full px-4 py-3 bg-white border border-[#c7c4d7]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4648d4] focus:border-[#4648d4] text-sm resize-none placeholder:text-gray-400"
              />
            </div>

            {/* Language Tags */}
            <div>
              <label className="block text-sm font-bold text-[#191c1e] mb-3">
                Language Tags
              </label>
              <TagSelector
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
              />
            </div>

            {/* Personal Notes */}
            <div>
              <label className="block text-sm font-bold text-[#191c1e] mb-2">
                Personal Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your personal comments, observations, or reminders about this item..."
                rows={6}
                className="w-full px-4 py-3 bg-white border border-[#c7c4d7]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4648d4] focus:border-[#4648d4] text-sm resize-none placeholder:text-gray-400"
              />
              <p className="text-xs text-[#464554] mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#904900]"></span>
                Private notes visible only to you
              </p>
            </div>
          </form>
        </div>

        {/* Footer - Sticky Actions */}
        <div className="bg-white border-t border-[#c7c4d7]/20 px-8 py-6 shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-12 border-[#c7c4d7]/40 hover:bg-[#f2f4f6] font-semibold text-[#464554]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-item-form"
              disabled={isLoading || !name.trim()}
              className="flex-1 h-12 bg-gradient-to-br from-[#4648d4] to-[#6063ee] hover:shadow-xl font-semibold text-white shadow-lg shadow-[#4648d4]/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
