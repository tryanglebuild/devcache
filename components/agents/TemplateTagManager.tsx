'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface TemplateTagManagerProps {
  agentId: string
  isOpen: boolean
  onClose: () => void
  onTagsUpdated?: (tags: string[]) => void
}

export function TemplateTagManager({
  agentId,
  isOpen,
  onClose,
  onTagsUpdated
}: TemplateTagManagerProps) {
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      fetchTags()
    }
  }, [isOpen, agentId])

  const fetchTags = async () => {
    setFetching(true)
    try {
      const response = await fetch(`/api/collections/${agentId}/tags`)
      if (response.ok) {
        const data = await response.json()
        const tagNames = data.map((t: any) => t.tag_name)
        setTags(tagNames)
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    } finally {
      setFetching(false)
    }
  }

  const handleAddTag = async () => {
    const trimmedTag = newTag.trim()
    if (!trimmedTag) return

    if (tags.includes(trimmedTag)) {
      toast.error('Tag already exists')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/collections/${agentId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag_name: trimmedTag })
      })

      if (response.ok) {
        const updatedTags = [...tags, trimmedTag]
        setTags(updatedTags)
        setNewTag('')
        toast.success('Tag added')
        onTagsUpdated?.(updatedTags)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to add tag')
      }
    } catch (error) {
      console.error('Error adding tag:', error)
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveTag = async (tagName: string) => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/collections/${agentId}/tags?tag_name=${encodeURIComponent(tagName)}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        const updatedTags = tags.filter(t => t !== tagName)
        setTags(updatedTags)
        toast.success('Tag removed')
        onTagsUpdated?.(updatedTags)
      } else {
        toast.error('Failed to remove tag')
      }
    } catch (error) {
      console.error('Error removing tag:', error)
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-[#4648d4]" />
            Manage Tags
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Tag Input */}
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="Add a tag..."
              disabled={loading}
              className="flex-1"
            />
            <button
              onClick={handleAddTag}
              disabled={loading || !newTag.trim()}
              className="px-4 py-2 bg-[#4648d4] text-white rounded-lg font-semibold hover:bg-[#6063ee] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>

          {/* Tags List */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-[#464554]">
              Your Tags ({tags.length})
            </p>
            
            {fetching ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4648d4]" />
              </div>
            ) : tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#4648d4]/10 text-[#4648d4] rounded-lg text-sm font-medium"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      disabled={loading}
                      className="hover:bg-[#4648d4]/20 rounded p-0.5 transition-colors disabled:opacity-50"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-[#464554]">
                No tags yet. Add your first tag above.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
