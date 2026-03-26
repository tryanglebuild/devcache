'use client'

import { useState, useEffect } from 'react'
import { Tables } from '@/types/database.types'
import { Folder, FileText, Star, MoreVertical, Edit, Trash2, Eye, Paperclip } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EditItemSheet } from './EditItemSheet'
import { ViewFileDialog } from './ViewFileDialog'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

type ProjectItem = Tables<'project_items'>

interface ItemCardProps {
  item: ProjectItem
  onOpen?: () => void
  onUpdate: (item: ProjectItem) => void
  onDelete: (id: string) => void
}

export function ItemCard({ item, onOpen, onUpdate, onDelete }: ItemCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [attachmentCount, setAttachmentCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    loadAttachmentCount()
  }, [item.id])

  const loadAttachmentCount = async () => {
    const { count } = await supabase
      .from('project_file_attachments')
      .select('*', { count: 'exact', head: true })
      .eq('project_item_id', item.id)

    setAttachmentCount(count || 0)
  }

  const handleToggleFavorite = async () => {
    const { data, error } = await supabase
      .from('project_items')
      .update({ is_favorite: !item.is_favorite })
      .eq('id', item.id)
      .select()
      .single()

    if (error) {
      toast.error('Failed to update favorite')
      return
    }

    onUpdate(data)
    toast.success(data.is_favorite ? 'Added to favorites' : 'Removed from favorites')
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return
    }

    const { error } = await supabase
      .from('project_items')
      .delete()
      .eq('id', item.id)

    if (error) {
      toast.error('Failed to delete item')
      return
    }

    onDelete(item.id)
    toast.success('Item deleted successfully')
  }

  const isFolder = item.type === 'folder'
  const Icon = isFolder ? Folder : FileText

  return (
    <>
      <div
        className="bg-white p-5 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] hover:shadow-lg transition-all cursor-pointer group relative"
        onClick={() => {
          if (isFolder) {
            // Navigate to folder detail page
            if (onOpen) {
              onOpen()
            }
          } else {
            // Navigate to file view page
            window.location.href = `/dashboard/projects/file/${item.id}`
          }
        }}
      >
        {/* Favorite Star */}
        {item.is_favorite && (
          <div className="absolute top-3 right-3">
            <Star className="h-4 w-4 text-[#904900] fill-[#904900]" />
          </div>
        )}

        {/* Icon */}
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
          isFolder 
            ? 'bg-[#4648d4]/10 text-[#4648d4]' 
            : 'bg-[#575992]/10 text-[#575992]'
        }`}>
          <Icon className="h-6 w-6" />
        </div>

        {/* Name */}
        <h3 className="font-bold text-[#191c1e] mb-1 truncate pr-6">
          {item.name}
        </h3>

        {/* Description */}
        {item.description && (
          <p className="text-xs text-[#464554] mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Language Tags */}
        {item.language_tags && item.language_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {item.language_tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-[#f2f4f6] text-[#464554] rounded text-[10px] font-bold uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
            {item.language_tags.length > 3 && (
              <span className="px-2 py-0.5 bg-[#f2f4f6] text-[#464554] rounded text-[10px] font-bold">
                +{item.language_tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#c7c4d7]/20">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#464554] font-medium">
              {formatDistanceToNow(new Date(item.updated_at!), { addSuffix: true })}
            </span>
            {attachmentCount > 0 && (
              <>
                <span className="text-[#c7c4d7]">•</span>
                <div className="flex items-center gap-1 text-[#4648d4]">
                  <Paperclip className="h-3 w-3" />
                  <span className="text-[10px] font-bold">{attachmentCount}</span>
                </div>
              </>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className="p-1 hover:bg-[#f2f4f6] rounded transition-colors"
            >
              <MoreVertical className="h-4 w-4 text-[#464554]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isFolder && (
                <>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation()
                    setIsViewDialogOpen(true)
                  }}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                setIsEditDialogOpen(true)
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                handleToggleFavorite()
              }}>
                <Star className="h-4 w-4 mr-2" />
                {item.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete()
                }}
                className="text-[#ba1a1a]"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <EditItemSheet
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        item={item}
        onItemUpdated={onUpdate}
      />

      {!isFolder && (
        <ViewFileDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          item={item}
        />
      )}
    </>
  )
}
