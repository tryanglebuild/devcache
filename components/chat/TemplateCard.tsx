'use client'

import { useState } from 'react'
import { Eye, Star, Download, User } from 'lucide-react'
import { ResourcePreviewModal } from './ResourcePreviewModal'

interface TemplateCardProps {
  templateId: string
  templateName: string
  description?: string
  isOwn?: boolean
  isFavorite?: boolean
  rating?: number
  downloads?: number
}

export function TemplateCard({
  templateId,
  templateName,
  description,
  isOwn = false,
  isFavorite = false,
  rating,
  downloads,
}: TemplateCardProps) {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowPreview(true)}
        className="group relative flex flex-col gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all w-full text-left"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {templateName}
            </h3>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                {description}
              </p>
            )}
          </div>
          <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          {isFavorite && (
            <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500">
              <Star className="w-3 h-3 fill-current" />
              <span>Favorite</span>
            </div>
          )}
          {isOwn && (
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-500">
              <User className="w-3 h-3" />
              <span>Your template</span>
            </div>
          )}
          {rating !== undefined && rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>{rating.toFixed(1)}</span>
            </div>
          )}
          {downloads !== undefined && downloads > 0 && (
            <div className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              <span>{downloads}</span>
            </div>
          )}
        </div>

        {/* Hover indicator */}
        <div className="absolute inset-0 rounded-lg ring-2 ring-blue-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </button>

      <ResourcePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        resourceId={templateId}
        resourceType="template"
        resourceName={templateName}
      />
    </>
  )
}
