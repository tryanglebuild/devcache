'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AGENT_CATEGORIES } from '@/types/agents.types'
import { ChevronLeft, ChevronRight, RotateCcw, Trash2, CircleX } from 'lucide-react'
import { TemplateHeader } from './TemplateHeader'
import { TemplateTags } from './TemplateTags'
import { TemplateStatsGrid } from './TemplateStatsGrid'
import { ExpiryWarning } from './ExpiryWarning'
import { ViewModeToggle } from './ViewModeToggle'
import { TemplateContentViewer } from './TemplateContentViewer'
import { TemplateMetadata } from './TemplateMetadata'

interface DeletedTemplate {
  id: string
  original_agent_id: string
  name: string
  description: string | null
  content: string
  category: string
  tags: string[] | null
  version: string
  visibility: string
  rating_average: number | null
  rating_count: number | null
  download_count: number | null
  created_at: string | null
  deleted_at: string
  days_remaining: number
  expires_at: string
}

export function DeletedTemplatesClient() {
  const router = useRouter()
  const [templates, setTemplates] = useState<DeletedTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [actionType, setActionType] = useState<'restore' | 'permanent' | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'rendered' | 'source'>('rendered')

  const selectedTemplate = templates[selectedIndex] || null

  useEffect(() => {
    fetchDeletedTemplates()
  }, [])

  const fetchDeletedTemplates = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/agents/deleted')
      const data = await response.json()

      if (response.ok) {
        setTemplates(data)
      } else {
        toast.error('Failed to load deleted templates')
      }
    } catch (error) {
      console.error('Error fetching deleted templates:', error)
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (template: DeletedTemplate) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/agents/${template.id}/restore`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('Template restored successfully')
        setActionType(null)
        fetchDeletedTemplates()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to restore template')
      }
    } catch (error) {
      console.error('Error restoring template:', error)
      toast.error('An error occurred')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePermanentDelete = async (template: DeletedTemplate) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/agents/${template.id}/permanent`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Template permanently deleted')
        setActionType(null)
        fetchDeletedTemplates()
        if (selectedIndex >= templates.length - 1) {
          setSelectedIndex(Math.max(0, templates.length - 2))
        }
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete template')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('An error occurred')
    } finally {
      setActionLoading(false)
    }
  }

  const goToPrevious = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    }
  }

  const goToNext = () => {
    if (selectedIndex < templates.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    }
  }

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto p-6">
        <div className="mb-8">
          <div className="h-8 bg-[#f2f4f6] rounded w-64 mb-2 animate-pulse" />
          <div className="h-4 bg-[#f2f4f6] rounded w-96 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
              <div className="h-6 bg-[#f2f4f6] rounded w-3/4 mb-3" />
              <div className="h-4 bg-[#f2f4f6] rounded w-full mb-2" />
              <div className="h-4 bg-[#f2f4f6] rounded w-5/6" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#464554] mb-2">Deleted Templates</h1>
        <p className="text-[#464554]">
          Templates are kept for 30 days before permanent deletion
        </p>
      </div>

      {templates.length > 0 && selectedTemplate ? (
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Template List */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-4 sticky top-6">
              <h2 className="text-sm font-bold text-[#464554] uppercase tracking-wider mb-4">
                Deleted Templates ({templates.length})
              </h2>
              <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {templates.map((template, index) => {
                  const category = AGENT_CATEGORIES[template.category as keyof typeof AGENT_CATEGORIES] || AGENT_CATEGORIES.general
                  const isSelected = index === selectedIndex
                  const isExpiringSoon = template.days_remaining <= 7
                  
                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedIndex(index)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-[#4f46e5]/10 border-2 border-[#4f46e5]'
                          : 'bg-[#f2f4f6] hover:bg-[#e5e7eb] border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0"
                          style={{ backgroundColor: category.color }}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {category.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-[#191c1e] truncate">
                            {template.name}
                          </p>
                          <p className="text-xs text-[#464554] truncate">
                            {template.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-gray-500">
                        {template.days_remaining === 0 
                          ? 'Expires today' 
                          : `${template.days_remaining}d remaining`}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Content - Template Detail */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-6">
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={goToPrevious}
                disabled={selectedIndex === 0}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#c7c4d7]/30 rounded-lg hover:bg-[#f2f4f6] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <span className="text-sm text-[#464554] font-medium">
                {selectedIndex + 1} of {templates.length}
              </span>
              <button
                onClick={goToNext}
                disabled={selectedIndex === templates.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#c7c4d7]/30 rounded-lg hover:bg-[#f2f4f6] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Template Header */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-[#e5e7eb]">
              <div className="mb-6">
                <TemplateHeader
                  name={selectedTemplate.name}
                  description={selectedTemplate.description}
                  categoryIcon={AGENT_CATEGORIES[selectedTemplate.category as keyof typeof AGENT_CATEGORIES]?.icon || 'smart_toy'}
                  categoryColor={AGENT_CATEGORIES[selectedTemplate.category as keyof typeof AGENT_CATEGORIES]?.color || '#4f46e5'}
                />
              </div>

              {/* Tags */}
              {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                <div className="mb-6">
                  <TemplateTags
                    tags={selectedTemplate.tags}
                    color={AGENT_CATEGORIES[selectedTemplate.category as keyof typeof AGENT_CATEGORIES]?.color || '#4f46e5'}
                  />
                </div>
              )}

              {/* Stats */}
              <div className="mb-6">
                <TemplateStatsGrid
                  ratingAverage={selectedTemplate.rating_average}
                  ratingCount={selectedTemplate.rating_count}
                  downloadCount={selectedTemplate.download_count}
                  visibility={selectedTemplate.visibility}
                  version={selectedTemplate.version}
                />
              </div>

              {/* Expiry Warning */}
              <ExpiryWarning
                daysRemaining={selectedTemplate.days_remaining}
                expiresAt={selectedTemplate.expires_at}
                itemType="template"
              />

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-[#e5e7eb]">
                <Button
                  onClick={() => setActionType('restore')}
                  className="flex-1 bg-[#4f46e5] hover:bg-[#4338ca] text-white shadow-lg"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restore Template
                </Button>
                <Button
                  onClick={() => setActionType('permanent')}
                  variant="outline"
                  className="border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  <CircleX className="h-4 w-4 mr-2" />
                  Delete Forever
                </Button>
              </div>
            </div>

            {/* View Mode Toggle */}
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {/* Content */}
            <TemplateContentViewer
              content={selectedTemplate.content}
              viewMode={viewMode}
            />

            {/* Metadata */}
            <TemplateMetadata
              createdAt={selectedTemplate.created_at!}
              deletedAt={selectedTemplate.deleted_at}
              expiresAt={selectedTemplate.expires_at}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f2f4f6] flex items-center justify-center">
            <Trash2 className="h-8 w-8 text-[#464554]" strokeWidth={1} />
          </div>
          <p className="text-[#464554] font-medium mb-2">No deleted templates</p>
          <p className="text-sm text-[#464554] mb-4">
            Deleted templates will appear here for 30 days
          </p>
          <Button
            onClick={() => router.push('/dashboard/projects')}
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white"
          >
            Go to Projects
          </Button>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={!!actionType} onOpenChange={() => setActionType(null)}>
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              {actionType === 'restore' ? (
                <>
                  <RotateCcw className="h-5 w-5 text-[#4f46e5]" />
                  Restore Template
                </>
              ) : (
                <>
                  <CircleX className="h-5 w-5 text-red-600 dark:text-red-400" strokeWidth={2} />
                  Permanently Delete
                </>
              )}
            </DialogTitle>
            <DialogDescription className="pt-3">
              {actionType === 'restore' ? (
                <>
                  Restore <strong className="text-[#191c1e] font-semibold">{selectedTemplate?.name}</strong> back to your templates?
                  <span className="block mt-3 p-3 bg-[#4f46e5]/5 border border-[#4f46e5]/20 rounded-lg text-sm text-[#4f46e5] font-medium">
                    It will be available immediately after restoration.
                  </span>
                </>
              ) : (
                <>
                  Permanently delete <strong className="text-[#191c1e] font-semibold">{selectedTemplate?.name}</strong>?
                  <span className="block mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium">
                    This action cannot be undone. The template will be lost forever.
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setActionType(null)}
              disabled={actionLoading}
              className="flex-1 sm:flex-none border-[#c7c4d7]/30 hover:bg-[#f2f4f6]"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedTemplate) {
                  if (actionType === 'restore') {
                    handleRestore(selectedTemplate)
                  } else {
                    handlePermanentDelete(selectedTemplate)
                  }
                }
              }}
              disabled={actionLoading}
              className={`flex-1 sm:flex-none shadow-lg hover:shadow-xl transition-all ${
                actionType === 'restore'
                  ? 'bg-[#4f46e5] hover:bg-[#4338ca] text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {actionLoading ? 'Processing...' : actionType === 'restore' ? 'Restore Template' : 'Delete Forever'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
