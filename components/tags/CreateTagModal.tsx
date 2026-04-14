'use client'

import { useState, useEffect } from 'react'
import { Tables } from '@/types/database.types'
import { Tag as TagIcon } from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

type UserTag = Tables<'user_tags'>

interface CreateTagModalProps {
  isOpen: boolean
  onClose: () => void
  onTagCreated: (tag: UserTag) => void
}

export function CreateTagModal({ isOpen, onClose, onTagCreated }: CreateTagModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#4F46E5')
  const [customColorInput, setCustomColorInput] = useState('#4F46E5')
  const [isLoading, setIsLoading] = useState(false)
  const [nameError, setNameError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    if (!name) { setNameError(''); return }
    if (!/^[a-z0-9.-]+$/.test(name)) setNameError('Lowercase letters, numbers, hyphens, and periods only')
    else if (name.length < 2) setNameError('At least 2 characters')
    else if (name.length > 30) setNameError('30 characters max')
    else setNameError('')
  }, [name])

  useEffect(() => { setCustomColorInput(color) }, [color])

  const handleCustomColorChange = (value: string) => {
    setCustomColorInput(value)
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) setColor(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast.error('Tag name is required'); return }
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('You must be logged in'); return }
      const { data, error } = await supabase
        .from('user_tags')
        .insert({ user_id: user.id, name: name.trim().toLowerCase(), description: description.trim() || null, color })
        .select().single()
      if (error) {
        error.code === '23505' ? toast.error('A tag with this name already exists') : (() => { throw error })()
        return
      }
      toast.success('Tag created')
      onTagCreated(data)
      handleClose()
    } catch {
      toast.error('Failed to create tag')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setName(''); setDescription(''); setColor('#4F46E5'); setCustomColorInput('#4F46E5'); setNameError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <form onSubmit={handleSubmit}>
        <ModalHeader
          icon={
            <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-surface-container-high flex items-center justify-center">
              <TagIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            </div>
          }
          subtitle="Create a new language tag for your projects"
        >
          New Tag
        </ModalHeader>

        <ModalBody className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Tag name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase())}
              placeholder="e.g. javascript, python, react"
              required
              className={`w-full px-3 py-2.5 bg-white dark:bg-surface-container border rounded-lg focus:ring-1 outline-none text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 transition-colors ${
                nameError
                  ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                  : name && !nameError
                  ? 'border-neutral-400 focus:ring-neutral-400'
                  : 'border-neutral-200 dark:border-white/[0.09] focus:ring-neutral-400 focus:border-neutral-400'
              }`}
            />
            <p className={`text-xs mt-1.5 ${nameError ? 'text-red-500' : 'text-neutral-400 dark:text-neutral-500'}`}>
              {nameError || 'Lowercase letters, numbers, hyphens, and periods'}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Description
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this tag..."
                rows={2}
                maxLength={200}
                className="w-full px-3 py-2.5 bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-lg focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 outline-none text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 resize-none transition-colors"
              />
              <span className="absolute bottom-2 right-2 text-[11px] text-neutral-400 dark:text-neutral-500">
                {description.length}/200
              </span>
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Color
            </label>
            <div className="p-4 bg-neutral-50 dark:bg-surface-container-high border border-neutral-200 dark:border-white/[0.09] rounded-lg mb-3">
              <HexColorPicker
                color={color}
                onChange={setColor}
                style={{ width: '100%', height: '180px' }}
              />
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-md border border-neutral-200 dark:border-white/[0.09] shrink-0"
                style={{ backgroundColor: color }}
              />
              <input
                value={customColorInput}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                placeholder="#4F46E5"
                maxLength={7}
                className="flex-1 px-3 py-2 bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-lg focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 outline-none text-sm font-mono uppercase text-neutral-900 dark:text-neutral-100 transition-colors"
              />
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Preview
            </label>
            <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-lg">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
                {name || 'tag name'}
              </span>
              {description && (
                <span className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
                  — {description}
                </span>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-md text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-surface-container-high disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !name.trim() || !!nameError}
            className="px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-md text-sm font-medium hover:bg-neutral-700 dark:hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {isLoading ? 'Creating...' : 'Create Tag'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
