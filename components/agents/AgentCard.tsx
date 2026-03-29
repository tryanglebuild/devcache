'use client'

import { Star, Download, Eye } from 'lucide-react'
import type { AgentTemplateWithStats } from '@/types/agents.types'
import { AGENT_CATEGORIES } from '@/types/agents.types'

interface AgentCardProps {
  agent: AgentTemplateWithStats
  onView?: (agent: AgentTemplateWithStats) => void
  onDownload?: (agent: AgentTemplateWithStats) => void
  compact?: boolean
}

export function AgentCard({ agent, onView, onDownload, compact = false }: AgentCardProps) {
  const category = AGENT_CATEGORIES[agent.category as keyof typeof AGENT_CATEGORIES] || AGENT_CATEGORIES.general

  const handleCardClick = () => {
    if (onView) {
      onView(agent)
    }
  }

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-xl p-4 shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] hover:shadow-lg transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${category.color}15`, color: category.color }}
          >
            <span className="material-symbols-outlined text-xl">{category.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[#191c1e] truncate group-hover:text-[#4648d4] transition-colors">
              {agent.name}
            </h3>
            <span 
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
              style={{ backgroundColor: `${category.color}15`, color: category.color }}
            >
              {category.label}
            </span>
          </div>
        </div>
        
        {agent.is_favorite && (
          <Star className="w-4 h-4 fill-[#904900] text-[#904900] flex-shrink-0" />
        )}
      </div>

      {!compact && agent.description && (
        <p className="text-sm text-[#464554] mb-3 line-clamp-2">
          {agent.description}
        </p>
      )}

      {agent.tags && agent.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {agent.tags.slice(0, compact ? 2 : 3).map((tag: string, index: number) => (
            <span
              key={index}
              className="text-[10px] bg-[#f2f4f6] text-[#464554] px-2 py-0.5 rounded font-medium"
            >
              {tag}
            </span>
          ))}
          {agent.tags.length > (compact ? 2 : 3) && (
            <span className="text-[10px] bg-[#f2f4f6] text-[#464554] px-2 py-0.5 rounded font-medium">
              +{agent.tags.length - (compact ? 2 : 3)}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-[#fbbf24] text-[#fbbf24]" />
            <span className="font-semibold text-[#191c1e]">
              {agent.rating_average?.toFixed(1) || '0.0'}
            </span>
            <span className="text-[#464554] text-xs">
              ({agent.rating_count || 0})
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-[#464554]">
            <Download className="w-4 h-4" />
            <span className="text-xs font-medium">
              {agent.download_count || 0}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onView && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onView(agent)
              }}
              className="text-[#4648d4] hover:text-[#6063ee] font-semibold text-xs flex items-center gap-1 transition-colors"
            >
              <Eye className="w-4 h-4" />
              View
            </button>
          )}
          
          {onDownload && agent.visibility === 'public' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDownload(agent)
              }}
              className="text-[#10b981] hover:text-[#059669] font-semibold text-xs flex items-center gap-1 transition-colors"
            >
              <Download className="w-4 h-4" />
              Get
            </button>
          )}
        </div>
      </div>

      {agent.author_name && (
        <div className="mt-3 pt-3 border-t border-[#c7c4d7]/10">
          <p className="text-[10px] text-[#464554] font-medium">
            by {agent.author_name}
          </p>
        </div>
      )}
    </div>
  )
}
