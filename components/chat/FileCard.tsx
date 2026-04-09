'use client'

import { useState } from 'react'
import { FileText, Eye } from 'lucide-react'
import { ResourcePreviewModal } from './ResourcePreviewModal'

interface FileCardProps {
  fileId: string
  fileName: string
  description?: string
  projectName?: string
}

export function FileCard({ fileId, fileName, description, projectName }: FileCardProps) {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowPreview(true)}
        className="block group w-full text-left"
      >
          <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-400 hover:shadow-md transition-all bg-white">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <FileText className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                  {fileName}
                </h4>
                <Eye className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
              
              {description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {description}
                </p>
              )}
              
              {projectName && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {projectName}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </button>

      <ResourcePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        resourceId={fileId}
        resourceType="file"
        resourceName={fileName}
      />
    </>
  )
}
