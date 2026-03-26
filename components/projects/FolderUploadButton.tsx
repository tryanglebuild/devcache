'use client'

import { useRef, useState } from 'react'
import { FolderUp, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
  parseFolderStructure,
  uploadFolderStructure,
  validateFolderStructure,
  FolderNode,
  UploadProgress,
} from '@/lib/storage/folder-upload'
import { FolderUploadDialog } from './FolderUploadDialog'
import { FileUploadDialog } from './FileUploadDialog'
import { Tables } from '@/types/database.types'

type ProjectItem = Tables<'project_items'>

interface FolderUploadButtonProps {
  parentId: string | null
  onUploadComplete: (items: ProjectItem[]) => void
  onUploadStart?: () => void
}

export function FolderUploadButton({
  parentId,
  onUploadComplete,
  onUploadStart,
}: FolderUploadButtonProps) {
  const folderInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [folderStructure, setFolderStructure] = useState<FolderNode | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const supabase = createClient()

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      // Parse folder structure
      const structure = parseFolderStructure(files)
      
      // Validate
      const validation = validateFolderStructure(structure)
      if (!validation.valid) {
        toast.error(validation.errors[0])
        return
      }

      setFolderStructure(structure)
    } catch (error) {
      console.error('Folder parse error:', error)
      toast.error('Failed to parse folder structure')
    } finally {
      // Reset input
      if (folderInputRef.current) {
        folderInputRef.current.value = ''
      }
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Show preview dialog
    setSelectedFiles(Array.from(files))

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileUploadConfirm = async () => {
    if (selectedFiles.length === 0) return

    setIsUploading(true)
    onUploadStart?.()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in')
        return
      }

      const totalFiles = selectedFiles.length
      let completedFiles = 0
      const errors: Array<{ path: string; error: string }> = []
      const createdItems: ProjectItem[] = []

      // Update progress
      const updateProgress = (fileName: string) => {
        setUploadProgress({
          total: totalFiles,
          completed: completedFiles,
          current: fileName,
          status: 'uploading',
          errors,
        })
      }

      // Upload each file
      for (const file of selectedFiles) {
        updateProgress(file.name)

        try {
          // Create file project_item
          const { data: fileItem, error: fileItemError } = await supabase
            .from('project_items')
            .insert({
              user_id: user.id,
              parent_id: parentId,
              name: file.name,
              type: 'file',
            })
            .select()
            .single()

          if (fileItemError) throw fileItemError

          // Upload to storage
          const filePath = `${user.id}/${fileItem.id}/${Date.now()}-${file.name}`
          const { error: uploadError } = await supabase.storage
            .from('project-files')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
            })

          if (uploadError) {
            // Cleanup: delete the project_item
            await supabase.from('project_items').delete().eq('id', fileItem.id)
            throw uploadError
          }

          // Create file attachment record
          const { error: attachmentError } = await supabase
            .from('project_file_attachments')
            .insert({
              project_item_id: fileItem.id,
              user_id: user.id,
              file_name: file.name,
              file_path: filePath,
              file_size: file.size,
              mime_type: file.type || 'application/octet-stream',
            })

          if (attachmentError) {
            // Cleanup
            await supabase.storage.from('project-files').remove([filePath])
            await supabase.from('project_items').delete().eq('id', fileItem.id)
            throw attachmentError
          }

          createdItems.push(fileItem)
          completedFiles++
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          errors.push({ path: file.name, error: errorMessage })
          completedFiles++
        }
      }

      // Final progress update
      setUploadProgress({
        total: totalFiles,
        completed: completedFiles,
        current: '',
        status: errors.length > 0 ? 'error' : 'completed',
        errors,
      })

      if (createdItems.length > 0) {
        toast.success(`${createdItems.length} file(s) uploaded successfully`)
        onUploadComplete(createdItems)
      }

      if (errors.length > 0) {
        toast.error(`${errors.length} file(s) failed to upload`)
      }

      // Wait a moment to show completion, then close
      setTimeout(() => {
        handleFileUploadCancel()
      }, 1500)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload files')
      handleFileUploadCancel()
    } finally {
      setIsUploading(false)
      setUploadProgress(null)
    }
  }

  const handleFileUploadCancel = () => {
    setSelectedFiles([])
    setUploadProgress(null)
    setIsUploading(false)
  }

  const handleUploadConfirm = async () => {
    if (!folderStructure) return

    setIsUploading(true)
    onUploadStart?.()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in')
        return
      }

      const result = await uploadFolderStructure(
        folderStructure,
        parentId,
        user.id,
        setUploadProgress
      )

      if (result.success && result.rootItem) {
        toast.success(`Folder "${folderStructure.name}" uploaded successfully`)
        
        // Fetch all newly created items
        const { data: newItems } = await supabase
          .from('project_items')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Last minute

        onUploadComplete(newItems || [])
      } else if (result.errors.length > 0) {
        toast.error(`Upload completed with ${result.errors.length} error(s)`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload folder')
    } finally {
      setIsUploading(false)
      setFolderStructure(null)
      setUploadProgress(null)
    }
  }

  const handleUploadCancel = () => {
    setFolderStructure(null)
    setUploadProgress(null)
    setIsUploading(false)
  }

  return (
    <>
      {/* Folder Input */}
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore - webkitdirectory is not in TypeScript types
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleFolderSelect}
        className="hidden"
      />
      
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,.pdf,.txt,.md,.json,.zip,.csv,.xlsx,.xls,.doc,.docx"
      />
      
      {/* Upload Files Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="px-4 py-2.5 bg-white border border-[#c7c4d7]/30 text-[#191c1e] rounded-lg font-bold text-sm hover:bg-[#f2f4f6] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Upload className="h-4 w-4" />
        Upload Files
      </button>

      {/* Upload Folder Button */}
      <button
        onClick={() => folderInputRef.current?.click()}
        disabled={isUploading}
        className="px-4 py-2.5 bg-gradient-to-br from-[#4648d4] to-[#6063ee] text-white rounded-lg font-bold text-sm shadow-lg shadow-[#4648d4]/20 hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FolderUp className="h-4 w-4" />
        Upload Folder
      </button>

      {selectedFiles.length > 0 && (
        <FileUploadDialog
          files={selectedFiles}
          uploadProgress={uploadProgress}
          isUploading={isUploading}
          onConfirm={handleFileUploadConfirm}
          onCancel={handleFileUploadCancel}
        />
      )}

      {folderStructure && (
        <FolderUploadDialog
          folderStructure={folderStructure}
          uploadProgress={uploadProgress}
          isUploading={isUploading}
          onConfirm={handleUploadConfirm}
          onCancel={handleUploadCancel}
        />
      )}
    </>
  )
}
