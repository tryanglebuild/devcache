'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { AgentTemplateWithStats } from '@/types/agents.types'
import { AGENT_CATEGORIES } from '@/types/agents.types'
import { Star, Eye, Globe, Lock, Tag, Bookmark, User } from 'lucide-react'
import { TemplateTagManager } from './TemplateTagManager'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface MyTemplatesClientProps {
  initialTemplates: AgentTemplateWithStats[]
  userId: string
}

type FilterView = 'all' | 'created' | 'saved' | 'public' | 'private'

export function MyTemplatesClient({ initialTemplates, userId }: MyTemplatesClientProps) {
  const router = useRouter()
  const [templates, setTemplates] = useState<AgentTemplateWithStats[]>(initialTemplates)
  const [filter, setFilter] = useState<FilterView>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [managingTagsFor, setManagingTagsFor] = useState<string | null>(null)
  const [templateTags, setTemplateTags] = useState<Record<string, string[]>>({})

  // Fetch tags for all templates
  useEffect(() => {
    const fetchAllTags = async () => {
      const tagsMap: Record<string, string[]> = {}
      
      await Promise.all(
        templates.map(async (template) => {
          try {
            const response = await fetch(`/api/collections/${template.id}/tags`)
            if (response.ok) {
              const data = await response.json()
              tagsMap[template.id] = data.map((t: any) => t.tag_name)
            }
          } catch (error) {
            console.error(`Error fetching tags for ${template.id}:`, error)
          }
        })
      )
      
      setTemplateTags(tagsMap)
    }

    fetchAllTags()
  }, [templates])

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    Object.values(templateTags).forEach(tags => {
      tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [templateTags])

  const filteredTemplates = useMemo(() => {
    let filtered = templates

    // Filter by type
    if (filter === 'created') {
      filtered = filtered.filter(t => t.is_owned)
    } else if (filter === 'saved') {
      filtered = filtered.filter(t => !t.is_owned)
    } else if (filter === 'public') {
      filtered = filtered.filter(t => t.visibility === 'public')
    } else if (filter === 'private') {
      filtered = filtered.filter(t => t.visibility === 'private')
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      )
    }

    // Filter by tag
    if (selectedTag !== 'all') {
      filtered = filtered.filter(t => 
        templateTags[t.id]?.includes(selectedTag)
      )
    }

    return filtered
  }, [templates, filter, searchQuery, selectedTag, templateTags])

  const createdCount = templates.filter(t => t.is_owned).length
  const savedCount = templates.filter(t => !t.is_owned).length
  const publicCount = templates.filter(t => t.visibility === 'public').length
  const privateCount = templates.filter(t => t.visibility === 'private').length

  const handleTagsUpdated = (agentId: string, tags: string[]) => {
    setTemplateTags(prev => ({
      ...prev,
      [agentId]: tags
    }))
  }

  return (
    <div className="max-w-[1200px] mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#464554] mb-2">My Templates</h1>
        <p className="text-[#464554]">
          Manage your created and saved agent templates
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            filter === 'all'
              ? 'bg-[#4648d4] text-white'
              : 'bg-white text-[#464554] hover:bg-[#f2f4f6] border border-[#c7c4d7]/30'
          }`}
        >
          All ({templates.length})
        </button>
        <button
          onClick={() => setFilter('created')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            filter === 'created'
              ? 'bg-[#4648d4] text-white'
              : 'bg-white text-[#464554] hover:bg-[#f2f4f6] border border-[#c7c4d7]/30'
          }`}
        >
          <User className="h-4 w-4" />
          Created ({createdCount})
        </button>
        <button
          onClick={() => setFilter('saved')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            filter === 'saved'
              ? 'bg-[#4648d4] text-white'
              : 'bg-white text-[#464554] hover:bg-[#f2f4f6] border border-[#c7c4d7]/30'
          }`}
        >
          <Bookmark className="h-4 w-4" />
          Saved ({savedCount})
        </button>
        <button
          onClick={() => setFilter('public')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            filter === 'public'
              ? 'bg-[#4648d4] text-white'
              : 'bg-white text-[#464554] hover:bg-[#f2f4f6] border border-[#c7c4d7]/30'
          }`}
        >
          <Globe className="h-4 w-4" />
          Public ({publicCount})
        </button>
        <button
          onClick={() => setFilter('private')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            filter === 'private'
              ? 'bg-[#4648d4] text-white'
              : 'bg-white text-[#464554] hover:bg-[#f2f4f6] border border-[#c7c4d7]/30'
          }`}
        >
          <Lock className="h-4 w-4" />
          Private ({privateCount})
        </button>
      </div>

      {/* Search and Tag Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#e5e7eb] mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="flex-1"
          />
          
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {allTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const category = AGENT_CATEGORIES[template.category as keyof typeof AGENT_CATEGORIES] || AGENT_CATEGORIES.general
            const userTags = templateTags[template.id] || []
            
            return (
              <div
                key={template.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-[#e5e7eb] hover:shadow-md transition-all group"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-md shrink-0"
                    style={{ background: `linear-gradient(135deg, ${category.color} 0%, ${category.color}dd 100%)` }}
                  >
                    <span className="material-symbols-outlined text-2xl">
                      {category.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-[#191c1e] mb-1 truncate">
                      {template.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-1 bg-[#f2f4f6] text-[#464554] rounded font-medium">
                        {template.category}
                      </span>
                      {template.visibility === 'public' ? (
                        <Globe className="h-3 w-3 text-[#16a34a]" />
                      ) : (
                        <Lock className="h-3 w-3 text-[#464554]" />
                      )}
                      {!template.is_owned && (
                        <Bookmark className="h-3 w-3 text-[#4648d4]" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {template.description && (
                  <p className="text-sm text-[#464554] line-clamp-2 mb-4">
                    {template.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-[#fbbf24] text-[#fbbf24]" />
                    <span className="font-semibold text-[#191c1e]">
                      {template.rating_average?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-[#464554]">
                      ({template.rating_count || 0})
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4 text-[#464554]" />
                    <span className="font-semibold text-[#191c1e]">
                      {template.download_count || 0}
                    </span>
                  </div>
                </div>

                {/* User Tags */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-[#464554]">Your Tags</p>
                    <button
                      onClick={() => setManagingTagsFor(template.id)}
                      className="text-xs text-[#4648d4] hover:text-[#6063ee] font-semibold flex items-center gap-1"
                    >
                      <Tag className="h-3 w-3" />
                      Manage
                    </button>
                  </div>
                  
                  {userTags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {userTags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded bg-[#4648d4]/10 text-[#4648d4] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {userTags.length > 3 && (
                        <span className="text-xs px-2 py-1 text-[#464554]">
                          +{userTags.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-[#464554] italic">No tags</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-[#c7c4d7]/10">
                  <button
                    onClick={() => router.push(`/marketplace/${template.id}`)}
                    className="flex-1 px-4 py-2 bg-[#4648d4] text-white rounded-lg font-semibold hover:bg-[#6063ee] transition-all text-sm"
                  >
                    View
                  </button>
                </div>

                {/* Author */}
                {template.author_name && (
                  <div className="mt-3 pt-3 border-t border-[#c7c4d7]/10">
                    <p className="text-[10px] text-[#464554] font-medium">
                      by {template.author_name}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f2f4f6] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#464554] text-3xl">
              inventory_2
            </span>
          </div>
          <p className="text-[#464554] font-medium mb-2">
            {searchQuery || selectedTag !== 'all' 
              ? 'No templates found' 
              : filter === 'all' 
                ? 'No templates yet' 
                : `No ${filter} templates`
            }
          </p>
          <p className="text-sm text-[#464554] mb-4">
            {filter === 'saved' 
              ? 'Save templates from the marketplace to see them here'
              : 'Create your first agent template from a project file'
            }
          </p>
          <button
            onClick={() => router.push(filter === 'saved' ? '/marketplace' : '/dashboard/projects')}
            className="px-6 py-3 bg-[#4648d4] text-white rounded-lg font-bold hover:bg-[#6063ee] transition-all"
          >
            {filter === 'saved' ? 'Browse Marketplace' : 'Go to Projects'}
          </button>
        </div>
      )}

      {/* Tag Manager Modal */}
      {managingTagsFor && (
        <TemplateTagManager
          agentId={managingTagsFor}
          isOpen={!!managingTagsFor}
          onClose={() => setManagingTagsFor(null)}
          onTagsUpdated={(tags) => handleTagsUpdated(managingTagsFor, tags)}
        />
      )}
    </div>
  )
}
