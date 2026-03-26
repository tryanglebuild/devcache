'use client'

import { useState, useRef } from 'react'
import { Tables } from '@/types/database.types'
import { Upload, File, X, Download, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

type FileAttachment = Tables<'project_file_attachments'>

interface FileUploadSectionProps {
  projectItemId: string
  attachments: FileAttachment[]
  onAttachmentsChange: (attachments: FileAttachment[]) => void
}

export function FileUploadSection({
  projectItemId,
  attachments,
  onAttachmentsChange,
}: FileUploadSectionProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to upload files')
        return
      }

      const uploadPromises = Array.from(files).map(async (file) => {
        // Upload to storage
        const filePath = `${user.id}/${projectItemId}/${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('project-files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          throw uploadError
        }

        // Create database record
        const { data: attachment, error: dbError } = await supabase
          .from('project_file_attachments')
          .insert({
            project_item_id: projectItemId,
            user_id: user.id,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
          })
          .select()
          .single()

        if (dbError) {
          // Cleanup storage if database insert fails
          await supabase.storage.from('project-files').remove([filePath])
          throw dbError
        }

        return attachment
      })

      const newAttachments = await Promise.all(uploadPromises)
      onAttachmentsChange([...attachments, ...newAttachments])
      toast.success(`${files.length} file(s) uploaded successfully`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload files')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDownload = async (attachment: FileAttachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('project-files')
        .download(attachment.file_path)

      if (error) throw error

      // Create download link
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = attachment.file_name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('File downloaded')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download file')
    }
  }

  const handleDelete = async (attachment: FileAttachment) => {
    if (!confirm(`Delete "${attachment.file_name}"?`)) return

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('project-files')
        .remove([attachment.file_path])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('project_file_attachments')
        .delete()
        .eq('id', attachment.id)

      if (dbError) throw dbError

      onAttachmentsChange(attachments.filter((a) => a.id !== attachment.id))
      toast.success('File deleted')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete file')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.txt,.md,.json,.zip,.csv,.xlsx,.xls"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full px-4 py-3 border-2 border-dashed border-[#c7c4d7]/30 rounded-lg hover:border-[#4648d4] hover:bg-[#4648d4]/5 transition-all flex items-center justify-center gap-2 text-[#464554] hover:text-[#4648d4] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="h-5 w-5" />
          <span className="font-semibold text-sm">
            {isUploading ? 'Uploading...' : 'Upload Files'}
          </span>
        </button>
        <p className="text-xs text-[#464554] mt-2 text-center">
          Max 50MB per file. Supports images, PDFs, documents, and archives.
        </p>
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-bold text-[#191c1e]">
            Attachments ({attachments.length})
          </p>
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-3 bg-[#f2f4f6] rounded-lg group"
            >
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#4648d4]">
                <File className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#191c1e] truncate">
                  {attachment.file_name}
                </p>
                <p className="text-xs text-[#464554]">
                  {formatFileSize(attachment.file_size)}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleDownload(attachment)}
                  className="p-2 hover:bg-white rounded-lg transition-colors text-[#4648d4]"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(attachment)}
                  className="p-2 hover:bg-white rounded-lg transition-colors text-[#ba1a1a]"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
