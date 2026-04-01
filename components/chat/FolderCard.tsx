'use client'

import { useState } from 'react'
import { Folder, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface FolderCardProps {
  folderId: string
  folderName: string
  description?: string
  itemCount?: number
}

export function FolderCard({ folderId, folderName, description, itemCount }: FolderCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/dashboard/projects/${folderId}`)
  }

  return (
    <button
      onClick={handleClick}
      className="block group w-full text-left"
    >
      <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all bg-white">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <Folder className="w-5 h-5 text-blue-600" />
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
              <Eye className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
            
            {description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {description}
              </p>
            )}
            
            <div className="flex items-center gap-1 mt-2 text-xs text-blue-600 font-medium">
              <span>Open folder</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}
