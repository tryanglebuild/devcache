'use client'

import { useState, useMemo } from 'react'
import { Tables } from '@/types/database.types'
import {
  Plus, Tag as TagIcon, Edit, Trash2, MoreVertical,
  Search, FileText, BarChart3, ChevronDown, ChevronUp, X,
} from 'lucide-react'
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
  const [showAnalytics, setShowAnalytics] = useState(false)
  const supabase = createClient()

  const tagsWithStats: TagWithStats[] = useMemo(() =>
    tags.map(tag => ({ ...tag, file_count: tagStats[tag.name] || 0 }))
  , [tags, tagStats])

  const filteredTags = useMemo(() => {
    let filtered = tagsWithStats
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(tag =>
        tag.name.toLowerCase().includes(q) ||
        tag.description?.toLowerCase().includes(q)
      )
    }
    filtered = [...filtered].sort((a, b) =>
      sortBy === 'usage' ? b.file_count - a.file_count : a.name.localeCompare(b.name)
    )
    return filtered
  }, [tagsWithStats, searchQuery, sortBy])

  const handleTagCreated = (newTag: UserTag) => setTags(prev => [...prev, newTag])
  const handleTagUpdated = (updated: UserTag) =>
    setTags(prev => prev.map(t => t.id === updated.id ? updated : t))

  const handleDelete = async (tag: UserTag) => {
    const fileCount = tagStats[tag.name] || 0
    const message = fileCount > 0
      ? `Delete "${tag.name}"? This will remove it from ${fileCount} file(s).`
      : `Delete "${tag.name}"?`
    if (!confirm(message)) return
    const { error } = await supabase.from('user_tags').delete().eq('id', tag.id)
    if (error) { toast.error('Failed to delete tag'); return }
    setTags(prev => prev.filter(t => t.id !== tag.id))
    toast.success('Tag deleted')
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              Language Tags
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Organize and manage tags across your projects.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-md text-xs font-medium hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            New Tag
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Tags', value: tags.length },
          {
            label: 'Tagged Files',
            value: Object.values(tagStats).reduce((s, c) => s + c, 0)
          },
          {
            label: 'Most Used',
            value: tagsWithStats.reduce((m, t) => t.file_count > m.file_count ? t : m,
              tagsWithStats[0] || { file_count: 0, name: 'N/A' } as TagWithStats
            ).name || 'N/A',
            isText: true,
          },
        ].map(({ label, value, isText }) => (
          <div
            key={label}
            className="bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-lg p-4"
          >
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{label}</p>
            <p className={`font-semibold text-neutral-900 dark:text-neutral-100 truncate ${isText ? 'text-sm' : 'text-2xl'}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Analytics (collapsible) */}
      <div className="mb-6">
        <button
          onClick={() => setShowAnalytics(v => !v)}
          className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mb-3"
        >
          {showAnalytics ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {showAnalytics ? 'Hide' : 'Show'} analytics
        </button>
        {showAnalytics && <TagAnalytics tags={tags} tagStats={tagStats} />}
      </div>

      {/* Search + Sort */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tags..."
              className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-lg focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 outline-none text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 dark:hover:bg-surface-container-high rounded transition-colors"
              >
                <X className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
              </button>
            )}
          </div>

          {/* Sort Pills */}
          <div className="flex items-center gap-1.5">
            {(['name', 'usage'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setSortBy(opt)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  sortBy === opt
                    ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                    : 'bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-surface-container-high'
                }`}
              >
                {opt === 'usage' && <BarChart3 className="h-3.5 w-3.5" />}
                {opt === 'name' ? 'A–Z' : 'Usage'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tags Grid */}
      {filteredTags.length === 0 ? (
        <div className="bg-neutral-50 dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-lg p-10 text-center">
          <TagIcon size={24} strokeWidth={1.5} className="mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            {searchQuery ? 'No tags found' : 'No tags yet'}
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-4">
            {searchQuery ? 'Try a different search term' : 'Create your first tag to organize projects'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-md text-xs font-medium hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors"
            >
              Create Tag
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTags.map((tag) => (
            <div
              key={tag.id}
              onClick={() => setSelectedTag(tag)}
              className="bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-lg p-4 hover:border-neutral-400 dark:hover:border-white/20 hover:shadow-sm transition-all cursor-pointer group relative"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  {/* Color dot */}
                  <div
                    className="w-3 h-3 rounded-full shrink-0 mt-0.5"
                    style={{ backgroundColor: tag.color }}
                  />
                  <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 uppercase tracking-wide group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                    {tag.name}
                  </h3>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="p-1 hover:bg-neutral-100 dark:hover:bg-surface-container-high rounded transition-colors opacity-0 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingTag(tag) }}>
                      <Edit className="h-3.5 w-3.5 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => { e.stopPropagation(); handleDelete(tag) }}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {tag.description && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3">
                  {tag.description}
                </p>
              )}

              <div className="flex items-center gap-1.5 pt-3 border-t border-neutral-100 dark:border-white/[0.06]">
                <FileText className="h-3 w-3 text-neutral-400 dark:text-neutral-500" />
                <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
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
