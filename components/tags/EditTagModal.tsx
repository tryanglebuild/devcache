'use client'

import { useState, useEffect } from 'react'
import { Tables } from '@/types/database.types'
import { Edit, Sparkles, Check } from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

type UserTag = Tables<'user_tags'>

interface EditTagModalProps {
  isOpen: boolean
  onClose: () => void
  tag: UserTag
  onTagUpdated: (tag: UserTag) => void
}

export function EditTagModal({ isOpen, onClose, tag, onTagUpdated }: EditTagModalProps) {
  const [name, setName] = useState(tag.name)
  const [description, setDescription] = useState(tag.description || '')
  const [color, setColor] = useState(tag.color)
  const [customColorInput, setCustomColorInput] = useState(tag.color)
  const [isLoading, setIsLoading] = useState(false)
  const [nameError, setNameError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    setName(tag.name)
    setDescription(tag.description || '')
    setColor(tag.color)
    setCustomColorInput(tag.color)
  }, [tag])

  // Validate name in real-time
  useEffect(() => {
    if (!name) {
      setNameError('')
      return
    }

    const validNameRegex = /^[a-z0-9.-]+$/
    if (!validNameRegex.test(name)) {
      setNameError('Use only lowercase letters, numbers, hyphens, and periods')
    } else if (name.length < 2) {
      setNameError('Tag name must be at least 2 characters')
    } else if (name.length > 30) {
      setNameError('Tag name must be less than 30 characters')
    } else {
      setNameError('')
    }
  }, [name])

  // Sync custom color input with selected color
  useEffect(() => {
    setCustomColorInput(color)
  }, [color])

  const handleCustomColorChange = (value: string) => {
    setCustomColorInput(value)
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      setColor(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Tag name is required')
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('user_tags')
        .update({
          name: name.trim().toLowerCase(),
          description: description.trim() || null,
          color,
        })
        .eq('id', tag.id)
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

      toast.success('Tag updated successfully')
      onTagUpdated(data)
      onClose()
    } catch (error) {
      console.error('Update tag error:', error)
      toast.error('Failed to update tag')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalHeader
          icon={<Edit className="h-7 w-7" />}
          subtitle="Update tag details"
        >
          Edit Tag
        </ModalHeader>

        <ModalBody className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#191c1e] uppercase tracking-wider">
              Tag Name <span className="text-[#ba1a1a]">*</span>
            </label>
            <div className="relative">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase())}
                placeholder="e.g., javascript, python, react"
                required
                className={`h-12 pr-10 transition-all placeholder:text-gray-400 ${
                  nameError 
                    ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]' 
                    : name && !nameError 
                    ? 'border-[#10b981] focus:ring-[#10b981]' 
                    : ''
                }`}
              />
              {name && !nameError && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Check className="h-5 w-5 text-[#10b981] animate-in fade-in zoom-in duration-200" />
                </div>
              )}
            </div>
            {nameError ? (
              <p className="text-xs text-[#ba1a1a] flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                <span className="inline-block w-1 h-1 rounded-full bg-[#ba1a1a]" />
                {nameError}
              </p>
            ) : (
              <p className="text-xs text-[#464554]">
                Use lowercase letters, numbers, hyphens, and periods
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#191c1e] uppercase tracking-wider">
              Description
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description..."
                rows={3}
                maxLength={200}
                className="w-full px-4 py-3 border border-[#c7c4d7]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] text-sm resize-none transition-all placeholder:text-gray-400"
              />
              <div className="absolute bottom-2 right-2 text-xs text-[#464554]">
                {description.length}/200
              </div>
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-4">
            <label className="block text-xs font-bold text-[#191c1e] uppercase tracking-wider">
              Color
            </label>
            
            {/* React Color Picker */}
            <div className="p-5 bg-gradient-to-br from-[#f8f9fa] to-[#f2f4f6] rounded-xl border border-[#c7c4d7]/20">
              <HexColorPicker 
                color={color} 
                onChange={setColor}
                style={{ width: '100%', height: '220px' }}
              />
            </div>

            {/* Hex Input */}
            <div className="flex items-center gap-3">
              <div 
                className="w-16 h-16 rounded-xl border-2 border-[#c7c4d7]/30 transition-all shadow-lg"
                style={{ backgroundColor: color }}
              />
              <div className="flex-1">
                <Input
                  value={customColorInput}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  placeholder="#4F46E5"
                  className="h-12 font-mono uppercase text-center text-base font-semibold"
                  maxLength={7}
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#191c1e] uppercase tracking-wider flex items-center gap-2">
              Preview
              <Sparkles className="h-3.5 w-3.5 text-[#4f46e5]" />
            </label>
            <div className="relative overflow-hidden">
              <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-[#f2f4f6] to-[#e8eaed] rounded-xl border border-[#c7c4d7]/20 transition-all duration-300">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg transition-all duration-300"
                  style={{ 
                    backgroundColor: color,
                    boxShadow: `0 4px 14px ${color}40`
                  }}
                >
                  <Edit className="h-7 w-7 drop-shadow" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#191c1e] uppercase tracking-wider text-base truncate transition-all duration-200">
                    {name || 'tag name'}
                  </p>
                  {description && (
                    <p className="text-xs text-[#464554] mt-1.5 line-clamp-2 animate-in slide-in-from-top-1 duration-200">
                      {description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-12"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !name.trim() || !!nameError}
            className="flex-1 h-12 bg-gradient-to-br from-[#4f46e5] to-[#4338ca] hover:from-[#3a3cb8] hover:to-[#4f52d4] transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
