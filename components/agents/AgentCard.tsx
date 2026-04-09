'use client'

import { Star, Download, Eye } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { AgentTemplateWithStats } from '@/types/agents.types'
import { AGENT_CATEGORIES } from '@/types/agents.types'
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from '@/lib/agents/category-icons'

interface AgentCardProps {
  agent: AgentTemplateWithStats
  onView?: (agent: AgentTemplateWithStats) => void
  onDownload?: (agent: AgentTemplateWithStats) => void
  compact?: boolean
}

export function AgentCard({ agent, onView, onDownload, compact = false }: AgentCardProps) {
  const category = AGENT_CATEGORIES[agent.category as keyof typeof AGENT_CATEGORIES] || AGENT_CATEGORIES.general
  const CategoryIcon = CATEGORY_ICONS[agent.category?.toLowerCase() || ''] || DEFAULT_CATEGORY_ICON
  const router = useRouter()

  const handleCardClick = () => {
    if (onView) {
      onView(agent)
    } else {
      router.push(`/marketplace/${agent.id}`)
    }
  }

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white dark:bg-surface-container rounded-xl p-4 shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] dark:shadow-none dark:ring-1 dark:ring-white/[0.08] hover:shadow-lg dark:hover:ring-white/[0.12] transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-surface-container-high flex items-center justify-center flex-shrink-0">
            <CategoryIcon size={20} strokeWidth={1.5} className="text-gray-500 dark:text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[#191c1e] dark:text-on-surface truncate group-hover:text-[#4f46e5] dark:group-hover:text-[#7c7ff5] transition-colors">
              {agent.name}
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-surface-container-high text-gray-500 dark:text-gray-400">
              {category.label}
            </span>
          </div>
        </div>
        
        {agent.is_favorite && (
          <Star className="w-4 h-4 fill-amber-400 text-amber-400 flex-shrink-0" />
        )}
      </div>

      {!compact && agent.description && (
        <p className="text-sm text-[#464554] dark:text-on-surface-variant mb-3 line-clamp-2">
          {agent.description}
        </p>
      )}

      {agent.tags && agent.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {agent.tags.slice(0, compact ? 2 : 3).map((tag: string, index: number) => (
            <span
              key={index}
              className="text-[10px] bg-[#f2f4f6] dark:bg-surface-container-high text-[#464554] dark:text-on-surface-variant px-2 py-0.5 rounded font-medium"
            >
              {tag}
            </span>
          ))}
          {agent.tags.length > (compact ? 2 : 3) && (
            <span className="text-[10px] bg-[#f2f4f6] dark:bg-surface-container-high text-[#464554] dark:text-on-surface-variant px-2 py-0.5 rounded font-medium">
              +{agent.tags.length - (compact ? 2 : 3)}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-[#191c1e] dark:text-on-surface">
              {agent.rating_average?.toFixed(1) || '0.0'}
            </span>
            <span className="text-[#464554] dark:text-on-surface-variant text-xs">
              ({agent.rating_count || 0})
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-[#464554] dark:text-on-surface-variant">
            <Download className="w-4 h-4" />
            <span className="text-xs font-medium">
              {agent.download_count || 0}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onView ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onView(agent)
              }}
              className="text-[#4f46e5] dark:text-[#7c7ff5] hover:text-[#4338ca] dark:hover:text-[#a5b4fc] font-semibold text-xs flex items-center gap-1 transition-colors"
            >
              <Eye className="w-4 h-4" />
              View
            </button>
          ) : (
            <Link
              href={`/marketplace/${agent.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[#4f46e5] dark:text-[#7c7ff5] hover:text-[#4338ca] dark:hover:text-[#a5b4fc] font-semibold text-xs flex items-center gap-1 transition-colors"
            >
              <Eye className="w-4 h-4" />
              View
            </Link>
          )}
          
          {onDownload && agent.visibility === 'public' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDownload(agent)
              }}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-semibold text-xs flex items-center gap-1 transition-colors"
            >
              <Download className="w-4 h-4" />
              Get
            </button>
          )}
        </div>
      </div>

      {agent.author_name && (
        <div className="mt-3 pt-3 border-t border-[#c7c4d7]/10 dark:border-white/[0.06]">
          <p className="text-[10px] text-[#464554] dark:text-on-surface-variant font-medium">
            by {agent.author_name}
          </p>
        </div>
      )}
    </div>
  )
}
