'use client'

import { Download, Eye } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { AgentTemplateWithStats } from '@/types/agents.types'
import { AGENT_CATEGORIES } from '@/types/agents.types'
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from '@/lib/agents/category-icons'

function SignalBars({ value }: { value: number }) {
  const heights = [5, 7, 9, 11, 13]
  return (
    <span className="inline-flex items-end gap-px">
      {heights.map((h, i) => (
        <span
          key={i}
          style={{ height: h }}
          className={`w-1 rounded-sm ${
            i < Math.round(value)
              ? 'bg-neutral-500 dark:bg-neutral-400'
              : 'bg-neutral-200 dark:bg-surface-container-high'
          }`}
        />
      ))}
    </span>
  )
}

interface AgentCardProps {
  agent: AgentTemplateWithStats
  onView?: (agent: AgentTemplateWithStats) => void
  compact?: boolean
}

export function AgentCard({ agent, onView, compact = false }: AgentCardProps) {
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
      className="bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-lg p-4 hover:border-neutral-400 dark:hover:border-white/20 hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-surface-container-high flex items-center justify-center flex-shrink-0">
            <CategoryIcon size={16} strokeWidth={1.5} className="text-neutral-500 dark:text-neutral-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
              {agent.name}
            </h3>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-surface-container-high text-neutral-400 dark:text-neutral-500">
              {category.label}
            </span>
          </div>
        </div>
        
        {agent.is_favorite && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" title="Favorite" />
        )}
      </div>

      {!compact && agent.description && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 line-clamp-2">
          {agent.description}
        </p>
      )}

      {agent.tags && agent.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {agent.tags.slice(0, compact ? 2 : 3).map((tag: string, index: number) => (
            <span
              key={index}
              className="text-[10px] bg-neutral-100 dark:bg-surface-container-high text-neutral-400 dark:text-neutral-500 px-1.5 py-0.5 rounded font-medium"
            >
              {tag}
            </span>
          ))}
          {agent.tags.length > (compact ? 2 : 3) && (
            <span className="text-[10px] bg-neutral-100 dark:bg-surface-container-high text-neutral-400 dark:text-neutral-500 px-1.5 py-0.5 rounded font-medium">
              +{agent.tags.length - (compact ? 2 : 3)}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <SignalBars value={agent.rating_average || 0} />
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              {agent.rating_average?.toFixed(1) || '0.0'}
            </span>
            <span className="text-neutral-400 dark:text-neutral-500 text-[11px]">
              ({agent.rating_count || 0})
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-neutral-400 dark:text-neutral-500">
            <Download className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">
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
              className="text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300 text-xs flex items-center gap-1 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              View
            </button>
          ) : (
            <Link
              href={`/marketplace/${agent.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300 text-xs flex items-center gap-1 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              View
            </Link>
          )}
        </div>
      </div>

      {agent.author_name && (
        <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-white/[0.09]">
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
            by {agent.author_name}
          </p>
        </div>
      )}
    </div>
  )
}
