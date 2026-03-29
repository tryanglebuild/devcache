'use client'

import { useState } from 'react'
import { X, Upload, AlertCircle } from 'lucide-react'
import { AGENT_CATEGORIES } from '@/types/agents.types'
import toast from 'react-hot-toast'

interface PublishToMarketplaceModalProps {
  isOpen: boolean
  onClose: () => void
  projectItem: {
    id: string
    name: string
    description?: string | null
    content?: string | null
    language_tags?: string[] | null
  }
  onSuccess?: () => void
}

export function PublishToMarketplaceModal({
  isOpen,
  onClose,
  projectItem,
  onSuccess
}: PublishToMarketplaceModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: projectItem.name,
    description: projectItem.description || '',
    category: 'general',
    tags: projectItem.language_tags?.join(', ') || '',
    version: '1.0.0'
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!projectItem.content) {
      toast.error('Cannot publish empty template')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/agents/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectItemId: projectItem.id,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
          version: formData.version,
          content: projectItem.content
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Template published to marketplace!')
        onSuccess?.()
        onClose()
      } else {
        toast.error(data.error || 'Failed to publish template')
      }
    } catch (error) {
      console.error('Error publishing template:', error)
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#c7c4d7]/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#191c1e]">
            Publish to Marketplace
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f2f4f6] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#464554]" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="mx-6 mt-6 p-4 bg-[#4648d4]/5 border border-[#4648d4]/20 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-[#4648d4] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-[#191c1e]">
            <p className="font-semibold mb-1">Publishing your template</p>
            <p className="text-[#464554]">
              Your template will be visible to all users in the marketplace. You can unpublish it anytime.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-[#191c1e] mb-2">
              Template Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 bg-white border border-[#c7c4d7]/20 rounded-lg focus:ring-2 focus:ring-[#4648d4]/20 focus:border-[#4648d4] outline-none"
              placeholder="Enter template name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-[#191c1e] mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              className="w-full px-4 py-2 bg-white border border-[#c7c4d7]/20 rounded-lg focus:ring-2 focus:ring-[#4648d4]/20 focus:border-[#4648d4] outline-none resize-none"
              placeholder="Describe what your template does"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-[#191c1e] mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="w-full px-4 py-2 bg-white border border-[#c7c4d7]/20 rounded-lg focus:ring-2 focus:ring-[#4648d4]/20 focus:border-[#4648d4] outline-none"
            >
              {Object.entries(AGENT_CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-bold text-[#191c1e] mb-2">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-[#c7c4d7]/20 rounded-lg focus:ring-2 focus:ring-[#4648d4]/20 focus:border-[#4648d4] outline-none"
              placeholder="react, typescript, api (comma separated)"
            />
            <p className="text-xs text-[#464554] mt-1">
              Separate tags with commas
            </p>
          </div>

          {/* Version */}
          <div>
            <label className="block text-sm font-bold text-[#191c1e] mb-2">
              Version
            </label>
            <input
              type="text"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-[#c7c4d7]/20 rounded-lg focus:ring-2 focus:ring-[#4648d4]/20 focus:border-[#4648d4] outline-none"
              placeholder="1.0.0"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-white border-2 border-[#c7c4d7]/20 text-[#464554] rounded-lg font-bold hover:bg-[#f2f4f6] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-[#4648d4] text-white rounded-lg font-bold hover:bg-[#6063ee] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                'Publishing...'
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Publish
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
