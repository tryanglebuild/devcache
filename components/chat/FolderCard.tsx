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
          <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-400 hover:shadow-md transition-all bg-white">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <Folder className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                  {folderName}
                </h4>
                {itemCount !== undefined && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                    {itemCount} items
                  </span>
                )}
                <button
                  className="preview-button p-1 rounded hover:bg-blue-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowPreview(true)
                  }}
                  aria-label="Preview folder"
                >
                  <Eye className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </button>
              </div>
              
              {description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {description}
                </p>
              )}
              
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 font-medium">
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
