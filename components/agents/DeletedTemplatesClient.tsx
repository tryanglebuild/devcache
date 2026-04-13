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
          <div className="h-5 bg-neutral-100 dark:bg-surface-container-high rounded w-48 mb-2 animate-pulse" />
          <div className="h-3.5 bg-neutral-100 dark:bg-surface-container-high rounded w-80 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-surface-container rounded-lg p-5 border border-neutral-200 dark:border-white/[0.09] animate-pulse">
              <div className="h-4 bg-neutral-100 dark:bg-surface-container-high rounded w-3/4 mb-3" />
              <div className="h-3 bg-neutral-100 dark:bg-surface-container-high rounded w-full mb-2" />
              <div className="h-3 bg-neutral-100 dark:bg-surface-container-high rounded w-5/6" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Deleted Templates</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Templates are kept for 30 days before permanent deletion
        </p>
      </div>

      {templates.length > 0 && selectedTemplate ? (
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Template List */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3">
            <div className="bg-white dark:bg-surface-container rounded-lg border border-neutral-200 dark:border-white/[0.09] p-3 sticky top-6">
              <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-3">
                {templates.length} template{templates.length !== 1 ? 's' : ''}
              </p>
              <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {templates.map((template, index) => {
                  const isSelected = index === selectedIndex
                  
                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedIndex(index)}
                      className={`w-full text-left p-2.5 rounded-md transition-all border ${
                        isSelected
                          ? 'bg-neutral-100 dark:bg-surface-container-high border-neutral-300 dark:border-white/[0.09]'
                          : 'bg-white dark:bg-surface-container hover:bg-neutral-50 dark:hover:bg-surface-container-high border-transparent'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {template.name}
                        </p>
                        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
                          {template.category} · {template.days_remaining === 0
                            ? 'Expires today'
                            : `${template.days_remaining}d left`}
                        </p>
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
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-neutral-600 dark:text-neutral-400"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </button>
              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                {selectedIndex + 1} / {templates.length}
              </span>
              <button
                onClick={goToNext}
                disabled={selectedIndex === templates.length - 1}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-neutral-600 dark:text-neutral-400"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Template Header */}
            <div className="bg-white dark:bg-surface-container p-6 rounded-lg border border-neutral-200 dark:border-white/[0.09]">
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
              <div className="flex gap-2 mt-5 pt-5 border-t border-neutral-100 dark:border-white/[0.09]">
                <Button
                  size="sm"
                  onClick={() => setActionType('restore')}
                  className="bg-neutral-900 hover:bg-neutral-700 text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-2" />
                  Restore
                </Button>
                <Button
                  size="sm"
                  onClick={() => setActionType('permanent')}
                  variant="outline"
                  className="border-neutral-200 dark:border-white/[0.09] text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-surface-container-high"
                >
                  <CircleX className="h-3.5 w-3.5 mr-2" />
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
        <div className="bg-neutral-50 dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-lg p-10 text-center">
          <Trash2 className="h-6 w-6 mx-auto mb-3 text-neutral-300 dark:text-neutral-700" strokeWidth={1.5} />
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">No deleted templates</p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-4">
            Deleted templates will appear here for 30 days
          </p>
          <Button
            size="sm"
            onClick={() => router.push('/dashboard/projects')}
            className="bg-neutral-900 hover:bg-neutral-700 text-white"
          >
            Go to Projects
          </Button>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={!!actionType} onOpenChange={() => setActionType(null)}>
        <DialogContent className="bg-white dark:bg-surface-container sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {actionType === 'restore'
                ? <RotateCcw className="h-4 w-4 text-neutral-400 dark:text-neutral-500 shrink-0" />
                : <CircleX className="h-4 w-4 text-red-500 shrink-0" />}
              <DialogTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {actionType === 'restore' ? 'Restore Template' : 'Delete Permanently'}
              </DialogTitle>
            </div>
            <DialogDescription className="pt-2 text-xs text-neutral-500 dark:text-neutral-400">
              {actionType === 'restore' ? (
                <>
                  Restore <strong className="text-neutral-700 dark:text-neutral-300 font-medium">{selectedTemplate?.name}</strong> back to your templates?
                  <span className="block mt-2 p-2.5 bg-neutral-50 dark:bg-surface-container-high border border-neutral-200 dark:border-white/[0.09] rounded-md">
                    It will be available immediately after restoration.
                  </span>
                </>
              ) : (
                <>
                  Permanently delete <strong className="text-neutral-700 dark:text-neutral-300 font-medium">{selectedTemplate?.name}</strong>?
                  <span className="block mt-2 p-2.5 bg-neutral-50 dark:bg-surface-container-high border border-neutral-200 dark:border-white/[0.09] rounded-md">
                    This action cannot be undone. The template will be lost forever.
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActionType(null)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              size="sm"
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
              className={actionType === 'restore'
                ? 'bg-neutral-900 hover:bg-neutral-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
              }
            >
              {actionLoading ? 'Processing...' : actionType === 'restore' ? 'Restore' : 'Delete Forever'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
