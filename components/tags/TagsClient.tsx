'use client'

import { useState } from 'react'
import { Tables } from '@/types/database.types'
import { Plus, Tag as TagIcon, Edit, Trash2, MoreVertical } from 'lucide-react'
import { CreateTagModal } from './CreateTagModal'
import { EditTagModal } from './EditTagModal'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import toast from 'react-hot-toast'

type LanguageTag = Tables<'language_tags'>

interface TagsClientProps {
  initialTags: LanguageTag[]
}

export function TagsClient({ initialTags }: TagsClientProps) {
  const [tags, setTags] = useState<LanguageTag[]>(initialTags)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<LanguageTag | null>(null)
  const supabase = createClient()

  const handleTagCreated = (newTag: LanguageTag) => {
    setTags([...tags, newTag])
  }

  const handleTagUpdated = (updatedTag: LanguageTag) => {
    setTags(tags.map(tag => tag.id === updatedTag.id ? updatedTag : tag))
  }

  const handleDelete = async (tag: LanguageTag) => {
    if (!confirm(`Delete tag "${tag.name}"? This will remove it from all projects.`)) {
      return
    }

    const { error } = await supabase
      .from('language_tags')
      .delete()
      .eq('id', tag.id)

    if (error) {
      toast.error('Failed to delete tag')
      return
    }

    setTags(tags.filter(t => t.id !== tag.id))
    toast.success('Tag deleted successfully')
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-[#191c1e] mb-2">
            Language Tags
          </h2>
          <p className="text-[#464554] font-medium">
            Create and manage tags to organize your projects
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-br from-[#4648d4] to-[#6063ee] text-white rounded-lg font-bold text-sm shadow-lg shadow-[#4648d4]/20 hover:shadow-xl transition-all flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          New Tag
        </button>
      </div>

      {/* Stats */}
      <div className="bg-white p-6 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#4648d4]/10 flex items-center justify-center text-[#4648d4]">
            <TagIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#464554] uppercase tracking-widest">
              Total Tags
            </p>
            <p className="text-2xl font-black text-[#191c1e]">{tags.length}</p>
          </div>
        </div>
      </div>

      {/* Tags Grid */}
      {tags.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f2f4f6] flex items-center justify-center">
            <TagIcon className="h-8 w-8 text-[#464554]" />
          </div>
          <p className="text-[#464554] font-medium mb-4">No tags yet</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-2.5 bg-gradient-to-br from-[#4648d4] to-[#6063ee] text-white rounded-lg font-bold text-sm shadow-lg shadow-[#4648d4]/20 hover:shadow-xl transition-all"
          >
            Create Your First Tag
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="bg-white p-5 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] hover:shadow-lg transition-all group relative"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-md"
                  style={{ backgroundColor: tag.color }}
                >
                  <TagIcon className="h-6 w-6" />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger className="p-1 hover:bg-[#f2f4f6] rounded transition-colors opacity-0 group-hover:opacity-100">
                    <MoreVertical className="h-4 w-4 text-[#464554]" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingTag(tag)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(tag)}
                      className="text-[#ba1a1a]"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <h3 className="font-bold text-[#191c1e] mb-1 uppercase tracking-wider">
                {tag.name}
              </h3>

              {tag.description && (
                <p className="text-xs text-[#464554] line-clamp-2">
                  {tag.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateTagModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTagCreated={handleTagCreated}
      />

      {editingTag && (
        <EditTagModal
          isOpen={!!editingTag}
          onClose={() => setEditingTag(null)}
          tag={editingTag}
          onTagUpdated={handleTagUpdated}
        />
      )}
    </div>
  )
}
