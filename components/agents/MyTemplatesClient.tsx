'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AgentTemplateWithStats } from '@/types/agents.types'
import { AGENT_CATEGORIES } from '@/types/agents.types'
import { Star, Eye, Globe, Lock } from 'lucide-react'

interface MyTemplatesClientProps {
  initialTemplates: AgentTemplateWithStats[]
}

type FilterView = 'all' | 'public' | 'private'

export function MyTemplatesClient({ initialTemplates }: MyTemplatesClientProps) {
  const router = useRouter()
  const [templates] = useState<AgentTemplateWithStats[]>(initialTemplates)
  const [filter, setFilter] = useState<FilterView>('all')

  const filteredTemplates = templates.filter(template => {
    if (filter === 'public') return template.visibility === 'public'
    if (filter === 'private') return template.visibility === 'private'
    return true
  })

  const publicCount = templates.filter(t => t.visibility === 'public').length
  const privateCount = templates.filter(t => t.visibility === 'private').length

  return (
    <div className="max-w-[1200px] mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#464554] mb-2">My Templates</h1>
        <p className="text-[#464554]">
          Manage your agent templates and visibility settings
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
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

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const category = AGENT_CATEGORIES[template.category as keyof typeof AGENT_CATEGORIES] || AGENT_CATEGORIES.general
            
            return (
              <div
                key={template.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-[#e5e7eb] hover:shadow-md transition-all cursor-pointer"
                onClick={() => router.push(`/marketplace/${template.id}`)}
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
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-[#f2f4f6] text-[#464554] rounded font-medium">
                        {template.category}
                      </span>
                      {template.visibility === 'public' ? (
                        <Globe className="h-3 w-3 text-[#16a34a]" />
                      ) : (
                        <Lock className="h-3 w-3 text-[#464554]" />
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
                <div className="flex items-center gap-4 text-sm">
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

                {/* Tags */}
                {template.tags && template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4">
                    {template.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 rounded bg-[#4648d4]/10 text-[#4648d4] font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    {template.tags.length > 3 && (
                      <span className="text-xs px-2 py-1 text-[#464554]">
                        +{template.tags.length - 3}
                      </span>
                    )}
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
            {filter === 'all' ? 'No templates yet' : `No ${filter} templates`}
          </p>
          <p className="text-sm text-[#464554] mb-4">
            Create your first agent template from a project file
          </p>
          <button
            onClick={() => router.push('/dashboard/projects')}
            className="px-6 py-3 bg-[#4648d4] text-white rounded-lg font-bold hover:bg-[#6063ee] transition-all"
          >
            Go to Projects
          </button>
        </div>
      )}
    </div>
  )
}
