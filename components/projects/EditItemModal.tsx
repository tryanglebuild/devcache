'use client'

import { useState, useEffect } from 'react'
import { Tables } from '@/types/database.types'
import { Folder, FileText } from 'lucide-react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { TagSelector } from './TagSelector'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

type ProjectItem = Tables<'project_items'>

interface EditItemModalProps {
  isOpen: boolean
  onClose: () => void
  item: ProjectItem
  onItemUpdated: (item: ProjectItem) => void
}

export function EditItemModal({ isOpen, onClose, item, onItemUpdated }: EditItemModalProps) {
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
    if (!name.trim()) { toast.error('Name is required'); return }
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
      .select().single()
    setIsLoading(false)
    if (error) { toast.error('Failed to update item'); return }
    toast.success('Item updated')
    onItemUpdated(data)
    onClose()
  }

  const Icon = item.type === 'folder' ? Folder : FileText

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalHeader
          icon={
            <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-surface-container-high flex items-center justify-center">
              <Icon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" strokeWidth={1.5} />
            </div>
          }
          subtitle={`Update your ${item.type === 'folder' ? 'folder' : 'document'} details`}
        >
          Edit {item.type === 'folder' ? 'Folder' : 'File'}
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
              placeholder="Enter name..."
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

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add comments, observations, or reminders..."
              rows={5}
              className="w-full px-3 py-2.5 bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-lg focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 outline-none text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 resize-none transition-colors"
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <button
            type="button"
            onClick={onClose}
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
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
