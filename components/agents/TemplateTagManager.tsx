'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Tag, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tables } from '@/types/database.types'

interface TemplateTagManagerProps {
  agentId: string
  isOpen: boolean
  onClose: () => void
  onTagsUpdated?: () => void
}

type UserTag = Tables<'user_tags'>

const MAX_TAGS = 10

export function TemplateTagManager({
  agentId,
  isOpen,
  onClose,
  onTagsUpdated
}: TemplateTagManagerProps) {
  const [availableTags, setAvailableTags] = useState<UserTag[]>([])
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [tagToRemove, setTagToRemove] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen, agentId])

  const loadData = async () => {
    setFetching(true)
    try {
      // Load all available user tags
      const { data: userTags } = await supabase
        .from('user_tags')
        .select('*')
        .order('name')

      if (userTags) {
        setAvailableTags(userTags)
      }

      // Load selected tags for this agent
      const response = await fetch(`/api/collections/${agentId}/tags`)
      if (response.ok) {
        const data = await response.json()
        setSelectedTagNames(data.map((t: any) => t.tag_name))
      }
    } catch (error) {
      console.error('Error loading tags:', error)
    } finally {
      setFetching(false)
    }
  }

  const handleToggleTag = async (tagName: string) => {
    const isSelected = selectedTagNames.includes(tagName)
    
    if (isSelected) {
      setTagToRemove(tagName)
    } else {
      await handleAddTag(tagName)
    }
  }

  const handleAddTag = async (tagName: string) => {
    if (selectedTagNames.length >= MAX_TAGS) {
      toast.error(`Maximum ${MAX_TAGS} tags allowed`)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/collections/${agentId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag_name: tagName })
      })

      if (response.ok) {
        setSelectedTagNames([...selectedTagNames, tagName])
        toast.success('Tag added')
        onTagsUpdated?.()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to add tag')
      }
    } catch (error) {
      console.error('Error adding tag:', error)
      toast.error('Network error')
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
        setSelectedTagNames(selectedTagNames.filter(t => t !== tagName))
        toast.success('Tag removed')
        onTagsUpdated?.()
      } else {
        toast.error('Failed to remove tag')
      }
    } catch (error) {
      console.error('Error removing tag:', error)
      toast.error('Network error')
    } finally {
      setLoading(false)
      setTagToRemove(null)
    }
  }

  const selectedTags = availableTags.filter(tag => selectedTagNames.includes(tag.name))
  const unselectedTags = availableTags.filter(tag => !selectedTagNames.includes(tag.name))

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-[#4648d4]" />
              Manage Tags
            </DialogTitle>
            <DialogDescription>
              Select tags from your library to organize this template. Maximum {MAX_TAGS} tags.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#464554]">
                    Selected Tags ({selectedTags.length}/{MAX_TAGS})
                  </p>
                  {selectedTags.length >= MAX_TAGS && (
                    <Badge variant="secondary" className="text-xs">
                      Limit reached
                    </Badge>
                  )}
                </div>
                
                {fetching ? (
                  <div className="space-y-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedTags.map((tag) => (
                      <div
                        key={tag.id}
                        className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-[#4648d4]/30 hover:border-[#4648d4]/50 transition-all group"
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md flex-shrink-0"
                          style={{ backgroundColor: tag.color }}
                        >
                          <Check className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#191c1e] text-sm uppercase tracking-wide">
                            {tag.name}
                          </p>
                          {tag.description && (
                            <p className="text-xs text-[#464554] truncate">
                              {tag.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => setTagToRemove(tag.name)}
                          disabled={loading}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
                          aria-label={`Remove ${tag.name} tag`}
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Available Tags */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#464554]">
                  Available Tags
                </p>
                <a
                  href="/dashboard/tags"
                  target="_blank"
                  className="text-xs text-[#4648d4] hover:text-[#6063ee] font-semibold flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Create New Tag
                </a>
              </div>
              
              {fetching ? (
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : unselectedTags.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto p-1">
                  {unselectedTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleToggleTag(tag.name)}
                      disabled={loading || selectedTagNames.length >= MAX_TAGS}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#c7c4d7]/20 hover:border-[#4648d4]/50 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md flex-shrink-0"
                        style={{ backgroundColor: tag.color }}
                      >
                        <Tag className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#191c1e] text-sm uppercase tracking-wide truncate">
                          {tag.name}
                        </p>
                        {tag.description && (
                          <p className="text-xs text-[#464554] truncate">
                            {tag.description}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 px-4 border-2 border-dashed border-[#464554]/20 rounded-lg">
                  <Tag className="h-10 w-10 text-[#464554]/30 mx-auto mb-3" />
                  <p className="text-sm text-[#464554] font-medium mb-1">
                    No tags available
                  </p>
                  <p className="text-xs text-[#464554]/60 mb-3">
                    Create tags in your tag library first
                  </p>
                  <a
                    href="/dashboard/tags"
                    target="_blank"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#4648d4] text-white rounded-lg font-semibold hover:bg-[#6063ee] transition-all text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Go to Tag Library
                  </a>
                </div>
              )}
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="pt-2 border-t border-[#464554]/10">
              <p className="text-xs text-[#464554]/60 text-center">
                Press <kbd className="px-1.5 py-0.5 bg-[#464554]/10 rounded text-[10px] font-mono">Esc</kbd> to close
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!tagToRemove} onOpenChange={() => setTagToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Tag?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove the tag <span className="font-semibold text-[#464554]">"{tagToRemove}"</span> from this template?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => tagToRemove && handleRemoveTag(tagToRemove)}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600"
            >
              {loading ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
