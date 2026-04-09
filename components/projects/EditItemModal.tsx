'use client'

import { useState, useEffect } from 'react'
import { Tables } from '@/types/database.types'
import { Folder, FileText } from 'lucide-react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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

export function EditItemModal({
  isOpen,
  onClose,
  item,
  onItemUpdated,
}: EditItemModalProps) {
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
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalHeader
          icon={<Icon className="h-7 w-7" />}
          subtitle={`Update your ${item.type === 'folder' ? 'folder' : 'document'} details`}
        >
          Edit {item.type === 'folder' ? 'Folder' : 'File'}
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
              required
              placeholder="Enter name..."
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
              className="w-full px-4 py-3 border border-[#c7c4d7]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] text-sm resize-none"
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

          {/* Personal Notes */}
          <div>
            <label className="block text-xs font-bold text-[#191c1e] mb-2 uppercase tracking-wider">
              Personal Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your personal comments, observations, or reminders..."
              rows={6}
              className="w-full px-4 py-3 border border-[#c7c4d7]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] text-sm resize-none"
            />
            <p className="text-xs text-[#464554] mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#904900]"></span>
              Private notes visible only to you
            </p>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="flex-1 bg-gradient-to-br from-[#4f46e5] to-[#4338ca]"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
