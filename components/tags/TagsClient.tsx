'use client'

import { useState, useMemo } from 'react'
import { Tables } from '@/types/database.types'
import { Plus, Tag as TagIcon, Edit, Trash2, MoreVertical, Search, TrendingUp, FileText, BarChart3, ChevronDown, ChevronUp } from 'lucide-react'
import { CreateTagModal } from './CreateTagModal'
import { EditTagModal } from './EditTagModal'
import { TagDetailsModal } from './TagDetailsModal'
import { TagAnalytics } from './TagAnalytics'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'

type UserTag = Tables<'user_tags'>

interface TagWithStats extends UserTag {
  file_count: number
}

interface TagsClientProps {
  initialTags: UserTag[]
  tagStats: Record<string, number>
}

export function TagsClient({ initialTags, tagStats }: TagsClientProps) {
  const [tags, setTags] = useState<UserTag[]>(initialTags)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<UserTag | null>(null)
  const [selectedTag, setSelectedTag] = useState<TagWithStats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'usage'>('name')
  const [showAnalytics, setShowAnalytics] = useState(true)
  const supabase = createClient()

  // Combine tags with stats
  const tagsWithStats: TagWithStats[] = useMemo(() => {
    return tags.map(tag => ({
      ...tag,
      file_count: tagStats[tag.name] || 0
    }))
  }, [tags, tagStats])

  // Filter and sort tags
  const filteredTags = useMemo(() => {
    let filtered = tagsWithStats

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(tag => 
        tag.name.toLowerCase().includes(query) ||
        tag.description?.toLowerCase().includes(query)
      )
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'usage') {
        return b.file_count - a.file_count
      }
      return a.name.localeCompare(b.name)
    })

    return filtered
  }, [tagsWithStats, searchQuery, sortBy])

  // Calculate stats
  const totalFiles = useMemo(() => {
    return Object.values(tagStats).reduce((sum, count) => sum + count, 0)
  }, [tagStats])

  const mostUsedTag = useMemo(() => {
    return tagsWithStats.reduce((max, tag) => 
      tag.file_count > max.file_count ? tag : max
    , tagsWithStats[0] || { file_count: 0 })
  }, [tagsWithStats])

  const handleTagCreated = (newTag: UserTag) => {
    setTags([...tags, newTag])
  }

  const handleTagUpdated = (updatedTag: UserTag) => {
    setTags(tags.map(tag => tag.id === updatedTag.id ? updatedTag : tag))
  }

  const handleDelete = async (tag: UserTag) => {
    const fileCount = tagStats[tag.name] || 0
    const message = fileCount > 0
      ? `Delete tag "${tag.name}"? This will remove it from ${fileCount} file(s).`
      : `Delete tag "${tag.name}"?`

    if (!confirm(message)) {
      return
    }

    const { error } = await supabase
      .from('user_tags')
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
            Organize and manage tags for your projects
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <div className="bg-white p-6 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#464554] uppercase tracking-widest">
                Tagged Files
              </p>
              <p className="text-2xl font-black text-[#191c1e]">{totalFiles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center text-[#f59e0b]">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#464554] uppercase tracking-widest">
                Most Used
              </p>
              <p className="text-lg font-black text-[#191c1e] truncate">
                {mostUsedTag?.name || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="space-y-3">
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="flex items-center gap-2 text-sm font-bold text-[#464554] hover:text-[#191c1e] transition-colors"
        >
          {showAnalytics ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          {showAnalytics ? 'Hide' : 'Show'} Analytics
        </button>
        
        {showAnalytics && (
          <TagAnalytics tags={tags} tagStats={tagStats} />
        )}
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)]">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#464554]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tags..."
              className="pl-10 h-11"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('name')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                sortBy === 'name'
                  ? 'bg-[#4648d4] text-white'
                  : 'bg-[#f2f4f6] text-[#464554] hover:bg-[#e8eaed]'
              }`}
            >
              A-Z
            </button>
            <button
              onClick={() => setSortBy('usage')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                sortBy === 'usage'
                  ? 'bg-[#4648d4] text-white'
                  : 'bg-[#f2f4f6] text-[#464554] hover:bg-[#e8eaed]'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Usage
            </button>
          </div>
        </div>
      </div>

      {/* Tags Grid */}
      {filteredTags.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f2f4f6] flex items-center justify-center">
            <TagIcon className="h-8 w-8 text-[#464554]" />
          </div>
          <p className="text-[#464554] font-medium mb-4">
            {searchQuery ? 'No tags found' : 'No tags yet'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-2.5 bg-gradient-to-br from-[#4648d4] to-[#6063ee] text-white rounded-lg font-bold text-sm shadow-lg shadow-[#4648d4]/20 hover:shadow-xl transition-all"
            >
              Create Your First Tag
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTags.map((tag) => (
            <div
              key={tag.id}
              className="bg-white p-5 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] hover:shadow-lg transition-all group relative cursor-pointer"
              onClick={() => setSelectedTag(tag)}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-md"
                  style={{ backgroundColor: tag.color }}
                >
                  <TagIcon className="h-6 w-6" />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger 
                    className="p-1 hover:bg-[#f2f4f6] rounded transition-colors opacity-0 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4 text-[#464554]" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingTag(tag)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(tag)
                      }}
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
                <p className="text-xs text-[#464554] line-clamp-2 mb-3">
                  {tag.description}
                </p>
              )}

              {/* Usage Badge */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#c7c4d7]/20">
                <FileText className="h-3.5 w-3.5 text-[#464554]" />
                <span className="text-xs font-bold text-[#464554]">
                  {tag.file_count} {tag.file_count === 1 ? 'file' : 'files'}
                </span>
              </div>
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

      {selectedTag && (
        <TagDetailsModal
          isOpen={!!selectedTag}
          onClose={() => setSelectedTag(null)}
          tag={selectedTag}
          fileCount={selectedTag.file_count}
        />
      )}
    </div>
  )
}
