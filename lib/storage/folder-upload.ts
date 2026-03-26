import { createClient } from '@/lib/supabase/client'
import { Tables } from '@/types/database.types'

type ProjectItem = Tables<'project_items'>

export interface FolderNode {
  name: string
  path: string
  type: 'folder' | 'file'
  file?: File
  children: FolderNode[]
}

export interface UploadProgress {
  total: number
  completed: number
  current: string
  status: 'uploading' | 'completed' | 'error' | 'cancelled'
  errors: Array<{ path: string; error: string }>
}

/**
 * Parse FileList from folder input into tree structure
 */
export function parseFolderStructure(files: FileList): FolderNode {
  const root: FolderNode = {
    name: 'root',
    path: '',
    type: 'folder',
    children: [],
  }

  // Get the common root folder name
  const firstFile = files[0]
  if (!firstFile) return root

  const pathParts = firstFile.webkitRelativePath.split('/')
  const rootFolderName = pathParts[0]

  root.name = rootFolderName
  root.path = rootFolderName

  // Build tree structure
  Array.from(files).forEach(file => {
    const relativePath = file.webkitRelativePath
    const parts = relativePath.split('/').slice(1) // Remove root folder name

    let currentNode = root

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1
      const path = [rootFolderName, ...parts.slice(0, index + 1)].join('/')

      let existingNode = currentNode.children.find(child => child.name === part)

      if (!existingNode) {
        existingNode = {
          name: part,
          path,
          type: isFile ? 'file' : 'folder',
          file: isFile ? file : undefined,
          children: [],
        }
        currentNode.children.push(existingNode)
      }

      if (!isFile) {
        currentNode = existingNode
      }
    })
  })

  return root
}

/**
 * Count total files in folder structure
 */
export function countFiles(node: FolderNode): number {
  let count = node.type === 'file' ? 1 : 0
  node.children.forEach(child => {
    count += countFiles(child)
  })
  return count
}

/**
 * Upload folder structure recursively
 */
export async function uploadFolderStructure(
  folderNode: FolderNode,
  parentId: string | null,
  userId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ success: boolean; rootItem: ProjectItem | null; errors: Array<{ path: string; error: string }> }> {
  const supabase = createClient()
  const errors: Array<{ path: string; error: string }> = []
  const totalFiles = countFiles(folderNode)
  let completedFiles = 0

  const updateProgress = (current: string, status: UploadProgress['status'] = 'uploading') => {
    if (onProgress) {
      onProgress({
        total: totalFiles,
        completed: completedFiles,
        current,
        status,
        errors,
      })
    }
  }

  /**
   * Recursively create folders and upload files
   */
  async function processNode(
    node: FolderNode,
    currentParentId: string | null
  ): Promise<ProjectItem | null> {
    try {
      if (node.type === 'folder') {
        // Create folder project_item
        updateProgress(node.path)

        const { data: folderItem, error: folderError } = await supabase
          .from('project_items')
          .insert({
            user_id: userId,
            parent_id: currentParentId,
            name: node.name,
            type: 'folder',
          })
          .select()
          .single()

        if (folderError) {
          errors.push({ path: node.path, error: folderError.message })
          return null
        }

        // Process children
        for (const child of node.children) {
          await processNode(child, folderItem.id)
        }

        return folderItem
      } else if (node.type === 'file' && node.file) {
        // Upload file
        updateProgress(node.path)

        // Create file project_item first
        const { data: fileItem, error: fileItemError } = await supabase
          .from('project_items')
          .insert({
            user_id: userId,
            parent_id: currentParentId,
            name: node.name,
            type: 'file',
          })
          .select()
          .single()

        if (fileItemError) {
          errors.push({ path: node.path, error: fileItemError.message })
          completedFiles++
          return null
        }

        // Upload to storage
        const filePath = `${userId}/${fileItem.id}/${Date.now()}-${node.file.name}`
        const { error: uploadError } = await supabase.storage
          .from('project-files')
          .upload(filePath, node.file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          errors.push({ path: node.path, error: uploadError.message })
          // Cleanup: delete the project_item
          await supabase.from('project_items').delete().eq('id', fileItem.id)
          completedFiles++
          return null
        }

        // Create file attachment record
        const { error: attachmentError } = await supabase
          .from('project_file_attachments')
          .insert({
            project_item_id: fileItem.id,
            user_id: userId,
            file_name: node.file.name,
            file_path: filePath,
            file_size: node.file.size,
            mime_type: node.file.type || 'application/octet-stream',
          })

        if (attachmentError) {
          errors.push({ path: node.path, error: attachmentError.message })
          // Cleanup
          await supabase.storage.from('project-files').remove([filePath])
          await supabase.from('project_items').delete().eq('id', fileItem.id)
        }

        completedFiles++
        return fileItem
      }

      return null
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      errors.push({ path: node.path, error: errorMessage })
      if (node.type === 'file') completedFiles++
      return null
    }
  }

  const rootItem = await processNode(folderNode, parentId)

  updateProgress('', errors.length > 0 ? 'error' : 'completed')

  return {
    success: errors.length === 0,
    rootItem,
    errors,
  }
}

/**
 * Validate folder structure before upload
 */
export function validateFolderStructure(node: FolderNode): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const MAX_FILES = 100
  const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
  const MAX_DEPTH = 10

  function checkNode(node: FolderNode, depth: number) {
    if (depth > MAX_DEPTH) {
      errors.push(`Folder structure too deep (max ${MAX_DEPTH} levels)`)
      return
    }

    if (node.type === 'file' && node.file) {
      if (node.file.size > MAX_FILE_SIZE) {
        errors.push(`File too large: ${node.name} (max 50MB)`)
      }
    }

    node.children.forEach(child => checkNode(child, depth + 1))
  }

  const fileCount = countFiles(node)
  if (fileCount > MAX_FILES) {
    errors.push(`Too many files: ${fileCount} (max ${MAX_FILES})`)
  }

  checkNode(node, 0)

  return {
    valid: errors.length === 0,
    errors,
  }
}
