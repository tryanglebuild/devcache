'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FolderNode, UploadProgress, countFiles } from '@/lib/storage/folder-upload'
import { Folder, FileText, Loader2, CheckCircle2, XCircle } from 'lucide-react'

interface FolderUploadDialogProps {
  folderStructure: FolderNode
  uploadProgress: UploadProgress | null
  isUploading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function FolderUploadDialog({
  folderStructure,
  uploadProgress,
  isUploading,
  onConfirm,
  onCancel,
}: FolderUploadDialogProps) {
  const totalFiles = countFiles(folderStructure)
  const totalFolders = countFolders(folderStructure)

  function countFolders(node: FolderNode): number {
    let count = node.type === 'folder' ? 1 : 0
    node.children.forEach(child => {
      count += countFolders(child)
    })
    return count
  }

  function renderTree(node: FolderNode, level: number = 0): React.ReactElement {
    const Icon = node.type === 'folder' ? Folder : FileText
    const color = node.type === 'folder' ? 'text-[#4f46e5]' : 'text-[#464554]'

    return (
      <div key={node.path}>
        <div
          className="flex items-center gap-2 py-1 text-sm"
          style={{ paddingLeft: `${level * 16}px` }}
        >
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="text-[#191c1e] font-medium truncate">{node.name}</span>
        </div>
        {node.children.map(child => renderTree(child, level + 1))}
      </div>
    )
  }

  const progressPercentage = uploadProgress
    ? Math.round((uploadProgress.completed / uploadProgress.total) * 100)
    : 0

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-[#4f46e5]" />
            {isUploading ? 'Uploading Folder' : 'Upload Folder Preview'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Summary */}
          <div className="bg-[#f7f9fb] p-4 rounded-lg">
            <h4 className="font-bold text-sm text-[#191c1e] mb-2">Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-[#464554]">Folder Name</p>
                <p className="font-bold text-[#191c1e]">{folderStructure.name}</p>
              </div>
              <div>
                <p className="text-[#464554]">Folders</p>
                <p className="font-bold text-[#191c1e]">{totalFolders}</p>
              </div>
              <div>
                <p className="text-[#464554]">Files</p>
                <p className="font-bold text-[#191c1e]">{totalFiles}</p>
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && uploadProgress && (
            <div className="bg-[#f7f9fb] p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-[#191c1e]">
                  Progress: {uploadProgress.completed} / {uploadProgress.total}
                </span>
                <span className="text-sm font-bold text-[#4f46e5]">
                  {progressPercentage}%
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#4f46e5] to-[#4338ca] transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              {uploadProgress.current && (
                <p className="text-xs text-[#464554] mt-2 truncate">
                  Current: {uploadProgress.current}
                </p>
              )}

              {/* Errors */}
              {uploadProgress.errors.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-bold text-[#ba1a1a]">
                    Errors ({uploadProgress.errors.length}):
                  </p>
                  <div className="max-h-20 overflow-y-auto space-y-1">
                    {uploadProgress.errors.map((error, index) => (
                      <div key={index} className="text-xs text-[#ba1a1a] flex items-start gap-1">
                        <XCircle className="h-3 w-3 shrink-0 mt-0.5" />
                        <span className="truncate">{error.path}: {error.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Folder Structure Preview */}
          {!isUploading && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <h4 className="font-bold text-sm text-[#191c1e] mb-2">Structure Preview</h4>
              <div className="flex-1 overflow-y-auto bg-[#f7f9fb] p-4 rounded-lg">
                {renderTree(folderStructure)}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#c7c4d7]/20">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isUploading}
            className="flex-1"
          >
            {isUploading ? 'Cancel' : 'Close'}
          </Button>
          {!isUploading && (
            <Button
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-br from-[#4f46e5] to-[#4338ca]"
            >
              Upload Folder
            </Button>
          )}
          {isUploading && uploadProgress?.status === 'completed' && (
            <Button
              onClick={onCancel}
              className="flex-1 bg-gradient-to-br from-[#10b981] to-[#059669]"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Done
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
