'use client'

import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { UploadProgress } from '@/lib/storage/folder-upload'
import { FileText, CheckCircle2, XCircle, Upload } from 'lucide-react'

interface FileUploadDialogProps {
  files: File[]
  uploadProgress: UploadProgress | null
  isUploading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function FileUploadDialog({
  files,
  uploadProgress,
  isUploading,
  onConfirm,
  onCancel,
}: FileUploadDialogProps) {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const progressPercentage = uploadProgress
    ? Math.round((uploadProgress.completed / uploadProgress.total) * 100)
    : 0

  return (
    <Modal isOpen={true} onClose={onCancel} size="xl">
      <ModalHeader
        icon={<Upload className="h-7 w-7" />}
        subtitle={
          isUploading 
            ? `Uploading ${files.length} file${files.length > 1 ? 's' : ''}...`
            : `Review ${files.length} file${files.length > 1 ? 's' : ''} before uploading`
        }
      >
        {isUploading ? 'Uploading Files' : 'Upload Files Preview'}
      </ModalHeader>

      <ModalBody className="space-y-6">
        {/* Summary */}
        <div className="bg-gradient-to-br from-[#f8f9fa] to-[#f2f4f6] p-6 rounded-xl border border-[#c7c4d7]/20">
          <h4 className="font-bold text-xs text-[#191c1e] mb-4 uppercase tracking-wider">Summary</h4>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-[#464554] mb-1.5 uppercase tracking-wider">Total Files</p>
              <p className="font-black text-3xl text-[#191c1e]">{files.length}</p>
            </div>
            <div>
              <p className="text-xs text-[#464554] mb-1.5 uppercase tracking-wider">Total Size</p>
              <p className="font-black text-3xl text-[#191c1e]">{formatSize(totalSize)}</p>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && uploadProgress && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#191c1e]">
                Progress: {uploadProgress.completed} / {uploadProgress.total}
              </span>
              <span className="text-sm font-bold text-[#4f46e5]">
                {progressPercentage}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-3 bg-[#e5e7eb] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#4f46e5] to-[#4338ca] transition-all duration-300 shadow-lg"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {uploadProgress.current && (
              <p className="text-xs text-[#464554] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5] animate-pulse"></span>
                Current: {uploadProgress.current}
              </p>
            )}

            {/* Errors */}
            {uploadProgress.errors.length > 0 && (
              <div className="p-4 bg-[#ba1a1a]/5 rounded-lg border border-[#ba1a1a]/20">
                <p className="text-xs font-bold text-[#ba1a1a] mb-2 uppercase tracking-wider">
                  Errors ({uploadProgress.errors.length}):
                </p>
                <div className="max-h-24 overflow-y-auto space-y-2">
                  {uploadProgress.errors.map((error, index) => (
                    <div key={index} className="text-xs text-[#ba1a1a] flex items-start gap-2 p-2 bg-white rounded">
                      <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span className="flex-1">{error.path}: {error.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* File List Preview */}
        {!isUploading && (
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-[#191c1e] uppercase tracking-wider">
              Files to Upload
            </h4>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {files.map((file, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-4 bg-gradient-to-br from-[#f8f9fa] to-[#f2f4f6] rounded-xl border border-[#c7c4d7]/20 hover:border-[#4f46e5]/40 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                    <FileText className="h-5 w-5 text-[#4f46e5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#191c1e] truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-[#464554] mt-0.5">
                      {formatSize(file.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isUploading && uploadProgress?.status === 'uploading'}
          className="flex-1 h-12 border-[#c7c4d7]/40 hover:bg-[#f2f4f6] font-semibold text-[#464554]"
        >
          {isUploading ? 'Cancel' : 'Close'}
        </Button>
        {!isUploading && (
          <Button
            onClick={onConfirm}
            className="flex-1 h-12 bg-gradient-to-br from-[#4f46e5] to-[#4338ca] hover:from-[#3a3cb8] hover:to-[#4f52d4] transition-all duration-200 text-white font-semibold"
          >
            Upload {files.length} File{files.length > 1 ? 's' : ''}
          </Button>
        )}
        {isUploading && uploadProgress?.status === 'completed' && (
          <Button
            onClick={onCancel}
            className="flex-1 h-12 bg-gradient-to-br from-[#10b981] to-[#059669] hover:from-[#0d9668] hover:to-[#047857] transition-all duration-200 text-white font-semibold"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Done
          </Button>
        )}
      </ModalFooter>
    </Modal>
  )
}
