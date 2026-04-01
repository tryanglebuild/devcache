'use client'

import { useState, useEffect } from 'react'
import { Tables } from '@/types/database.types'
import { Plus, X, Tag as TagIcon, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { HexColorPicker } from 'react-colorful'
import toast from 'react-hot-toast'

type UserTag = Tables<'user_tags'>

interface TagSelectorProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
}

export function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const [tags, setTags] = useState<UserTag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#4648d4')
  const [isSaving, setIsSaving] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    const { data, error } = await supabase
      .from('user_tags')
      .select('*')
      .order('name')

    if (!error && data) {
      setTags(data)
    }
    setIsLoading(false)
  }

  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter(t => t !== tagName))
    } else {
      onTagsChange([...selectedTags, tagName])
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error('Tag name is required')
      return
    }

    // Validate tag name format
    const tagNameRegex = /^[a-z0-9.-]+$/
    if (!tagNameRegex.test(newTagName)) {
      toast.error('Tag name must be lowercase with only letters, numbers, hyphens, and periods')
      return
    }

    setIsSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in')
        return
      }

      const { data, error } = await supabase
        .from('user_tags')
        .insert({
          name: newTagName.trim(),
          color: newTagColor,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          toast.error('A tag with this name already exists')
        } else {
          throw error
        }
        return
      }

      setTags([...tags, data])
      onTagsChange([...selectedTags, data.name])
      setNewTagName('')
      setNewTagColor('#4648d4')
      setIsCreating(false)
      toast.success('Tag created successfully')
    } catch (error) {
      console.error('Create tag error:', error)
      toast.error('Failed to create tag')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-3 border-[#4648d4] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Selected Tags Count */}
      {selectedTags.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-[#4648d4]"></div>
          <span className="font-semibold text-[#191c1e]">
            {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''} selected
          </span>
        </div>
      )}

      {/* Tags Grid */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag.name)
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.name)}
                className={`
                  group relative px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                  ${isSelected
                    ? 'text-white shadow-lg scale-105'
                    : 'bg-white border-2 border-[#c7c4d7]/30 text-[#464554] hover:border-[#4648d4]/50 hover:shadow-md'
                  }
                `}
                style={isSelected ? { 
                  backgroundColor: tag.color,
                  borderColor: tag.color 
                } : {}}
              >
                <span className="flex items-center gap-1.5">
                  {tag.name}
                  {isSelected && <Check className="h-3 w-3" />}
                </span>
                {!isSelected && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-1 rounded-b-lg"
                    style={{ backgroundColor: tag.color }}
                  />
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {tags.length === 0 && !isCreating && (
        <div className="text-center py-8 bg-gradient-to-br from-[#f2f4f6] to-[#e8eaed] rounded-xl border-2 border-dashed border-[#c7c4d7]/40">
          <TagIcon className="h-10 w-10 mx-auto text-[#464554] mb-3 opacity-50" />
          <p className="text-sm font-semibold text-[#191c1e] mb-1">No tags created yet</p>
          <p className="text-xs text-[#464554]">Create your first tag below</p>
        </div>
      )}

      {/* Create New Tag */}
      {!isCreating ? (
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-[#4648d4]/10 to-[#6063ee]/10 hover:from-[#4648d4]/20 hover:to-[#6063ee]/20 border-2 border-dashed border-[#4648d4]/30 rounded-xl text-[#4648d4] font-semibold text-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          Create New Tag
        </button>
      ) : (
        <div className="p-6 bg-white border-2 border-[#4648d4]/20 rounded-xl space-y-4 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-[#191c1e]">Create New Tag</h4>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false)
                setNewTagName('')
                setNewTagColor('#4648d4')
              }}
              className="p-1 hover:bg-[#f2f4f6] rounded transition-colors"
            >
              <X className="h-4 w-4 text-[#464554]" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#191c1e] mb-2">
              Tag Name <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value.toLowerCase())}
              placeholder="e.g., javascript, python, react"
              className="w-full h-10 px-3 bg-[#f7f9fb] border border-[#c7c4d7]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4648d4] focus:border-[#4648d4] text-sm placeholder:text-gray-400"
            />
            <p className="text-xs text-[#464554] mt-1.5">
              Lowercase letters, numbers, hyphens, and periods only
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#191c1e] mb-2">
              Color
            </label>
            <div className="flex gap-3">
              <HexColorPicker 
                color={newTagColor} 
                onChange={setNewTagColor}
                style={{ width: '100%', height: '120px' }}
              />
              <div className="flex flex-col gap-2">
                <div 
                  className="w-16 h-16 rounded-lg shadow-md border-2 border-white"
                  style={{ backgroundColor: newTagColor }}
                />
                <input
                  type="text"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="w-16 h-8 px-2 text-xs font-mono bg-[#f7f9fb] border border-[#c7c4d7]/30 rounded text-center"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsCreating(false)
                setNewTagName('')
                setNewTagColor('#4648d4')
              }}
              disabled={isSaving}
              className="flex-1 h-10 px-4 bg-white border border-[#c7c4d7]/40 text-[#464554] rounded-lg hover:bg-[#f2f4f6] font-semibold text-sm transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateTag}
              disabled={isSaving || !newTagName.trim()}
              className="flex-1 h-10 px-4 bg-gradient-to-br from-[#4648d4] to-[#6063ee] text-white rounded-lg hover:shadow-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Creating...
                </span>
              ) : (
                'Create Tag'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
