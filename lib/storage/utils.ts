import { createClient } from '@/lib/supabase/client'

export async function getPublicUrl(bucket: string, path: string) {
  const supabase = createClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options?: {
    cacheControl?: string
    upsert?: boolean
  }
) {
  const supabase = createClient()
  return await supabase.storage.from(bucket).upload(path, file, options)
}

export async function downloadFile(bucket: string, path: string) {
  const supabase = createClient()
  return await supabase.storage.from(bucket).download(path)
}

export async function deleteFile(bucket: string, path: string) {
  const supabase = createClient()
  return await supabase.storage.from(bucket).remove([path])
}

export async function listFiles(bucket: string, path: string) {
  const supabase = createClient()
  return await supabase.storage.from(bucket).list(path)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType.startsWith('video/')) return '🎥'
  if (mimeType.startsWith('audio/')) return '🎵'
  if (mimeType === 'application/pdf') return '📄'
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return '📦'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊'
  if (mimeType.includes('document') || mimeType.includes('word')) return '📝'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📊'
  if (mimeType.includes('json')) return '{ }'
  if (mimeType.includes('text')) return '📄'
  return '📎'
}
