'use client'
// Confirmation modal for individual file uploads.
// Shows a preview list of files and total size before upload, then displays a live progress bar
// with per-file status and error list during upload.

import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { UploadProgress } from '@/lib/storage/folder-upload'
import { FileText, CheckCircle2, XCircle, Upload } from 'lucide-react'

interface FileUploadDialogProps {
  files: File[]
  uploadProgress: UploadProgress | null
  isUploading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function FileUploadDialog({ files, uploadProgress, isUploading, onConfirm, onCancel }: FileUploadDialogProps) {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const progressPercentage = uploadProgress
    ? Math.round((uploadProgress.completed / uploadProgress.total) * 100)
    : 0

  return (
    <Modal isOpen={true} onClose={onCancel} size="lg">
      <ModalHeader
        icon={
          <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-surface-container-high flex items-center justify-center">
            <Upload className="h-4 w-4 text-neutral-500 dark:text-neutral-400" strokeWidth={1.5} />
          </div>
        }
        subtitle={
          isUploading
            ? `Uploading ${files.length} file${files.length > 1 ? 's' : ''}...`
            : `Review ${files.length} file${files.length > 1 ? 's' : ''} before uploading`
        }
      >
        {isUploading ? 'Uploading Files' : 'Upload Files'}
      </ModalHeader>

      <ModalBody className="space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Files', value: files.length },
            { label: 'Total Size', value: formatSize(totalSize) },
          ].map(({ label, value }) => (
            <div key={label} className="px-4 py-3 bg-neutral-50 dark:bg-surface-container-high border border-neutral-200 dark:border-white/[0.09] rounded-lg">
              <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">{value}</p>
            </div>
          ))}
        </div>

        {/* Upload Progress */}
        {isUploading && uploadProgress && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                {uploadProgress.completed} / {uploadProgress.total} files
              </span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100 tabular-nums">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-neutral-100 dark:bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-neutral-900 dark:bg-neutral-100 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            {uploadProgress.current && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse" />
                {uploadProgress.current}
              </p>
            )}
            {uploadProgress.errors.length > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
                <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">
                  {uploadProgress.errors.length} error{uploadProgress.errors.length > 1 ? 's' : ''}
                </p>
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {uploadProgress.errors.map((error, index) => (
                    <div key={index} className="text-xs text-red-600 dark:text-red-400 flex items-start gap-1.5">
                      <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{error.path}: {error.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* File List Preview */}
        {!isUploading && (
          <div className="space-y-1.5 max-h-[360px] overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-lg"
              >
                <div className="w-7 h-7 rounded-md bg-neutral-100 dark:bg-surface-container-high flex items-center justify-center shrink-0">
                  <FileText className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{file.name}</p>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500">{formatSize(file.size)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <button
          onClick={onCancel}
          disabled={isUploading && uploadProgress?.status === 'uploading'}
          className="px-4 py-2 bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-md text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-surface-container-high disabled:opacity-50 transition-colors"
        >
          {isUploading ? 'Cancel' : 'Close'}
        </button>
        {!isUploading && (
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-md text-sm font-medium hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors"
          >
            Upload {files.length} File{files.length > 1 ? 's' : ''}
          </button>
        )}
        {isUploading && uploadProgress?.status === 'completed' && (
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-md text-sm font-medium hover:bg-neutral-700 dark:hover:bg-neutral-200 flex items-center gap-2 transition-colors"
          >
            <CheckCircle2 className="h-4 w-4" />
            Done
          </button>
        )}
      </ModalFooter>
    </Modal>
  )
}
