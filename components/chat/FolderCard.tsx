'use client'

import { useState } from 'react'
import { Folder, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ResourcePreviewModal } from './ResourcePreviewModal'

interface FolderCardProps {
  folderId: string
  folderName: string
  description?: string
  itemCount?: number
}

export function FolderCard({ folderId, folderName, description, itemCount }: FolderCardProps) {
  const router = useRouter()
  const [showPreview, setShowPreview] = useState(false)

  const handleCardClick = () => {
    router.push(`/dashboard/projects/${folderId}`)
  }

  return (
    <>
      <div
        onClick={handleCardClick}
        className="block group w-full text-left cursor-pointer"
      >
          <div className="border border-gray-200 dark:border-white/[0.09] rounded-lg p-4 hover:border-gray-400 dark:hover:border-white/[0.2] hover:shadow-md dark:hover:shadow-none transition-all bg-white dark:bg-surface-container">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-surface-container-high rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-surface-container transition-colors">
              <Folder className="w-5 h-5 text-gray-500 dark:text-on-surface-variant" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900 dark:text-on-surface truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {folderName}
                </h4>
                {itemCount !== undefined && (
                  <span className="text-xs text-gray-500 dark:text-on-surface-variant bg-gray-100 dark:bg-surface-container-high px-2 py-1 rounded flex-shrink-0">
                    {itemCount} items
                  </span>
                )}
                <button
                  className="preview-button p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowPreview(true)
                  }}
                  aria-label="Preview folder"
                >
                  <Eye className="w-4 h-4 text-gray-400 dark:text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </button>
              </div>
              
              {description && (
                <p className="text-sm text-gray-600 dark:text-on-surface-variant mt-1 line-clamp-2">
                  {description}
                </p>
              )}
              
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-on-surface-variant font-medium">
                <span>Open folder</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ResourcePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        resourceId={folderId}
        resourceType="folder"
        resourceName={folderName}
      />
    </>
  )
}
