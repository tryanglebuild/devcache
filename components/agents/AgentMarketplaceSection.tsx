'use client'

import { useState } from 'react'
import { AgentCard } from './AgentCard'
import type { AgentTemplateWithStats } from '@/types/agents.types'
import { AGENT_CATEGORIES } from '@/types/agents.types'

interface AgentMarketplaceSectionProps {
  agents: AgentTemplateWithStats[]
  onViewAgent?: (agent: AgentTemplateWithStats) => void
  onDownloadAgent?: (agent: AgentTemplateWithStats) => void
  showFilters?: boolean
}

export function AgentMarketplaceSection({
  agents,
  onViewAgent,
  onDownloadAgent,
  showFilters = true
}: AgentMarketplaceSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredAgents =
    selectedCategory === 'all'
      ? agents
      : agents.filter((agent) => agent.category === selectedCategory)

  const categories = [
    { id: 'all', label: 'All', icon: 'apps', color: '#6b7280' },
    ...Object.entries(AGENT_CATEGORIES).map(([id, cat]) => ({
      id,
      label: cat.label,
      icon: cat.icon,
      color: cat.color
    }))
  ]

  if (!agents || agents.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)]">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f2f4f6] flex items-center justify-center">
          <span className="material-symbols-outlined text-[#464554] text-3xl">store</span>
        </div>
        <p className="text-[#464554] font-medium mb-2">No agents in marketplace yet</p>
        <p className="text-sm text-[#464554] mb-4">Be the first to publish an agent!</p>
        <a
          href="/dashboard/agents/new"
          className="inline-block px-6 py-2.5 bg-gradient-to-br from-[#4648d4] to-[#6063ee] text-white rounded-lg font-bold text-sm shadow-lg shadow-[#4648d4]/20 hover:shadow-xl transition-all"
        >
          Create Agent
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Filters */}
      {showFilters && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all border ${
                selectedCategory === category.id
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                  : 'bg-white text-[#464554] border-gray-200 hover:bg-gray-50 shadow-sm'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>
      )}

      {/* Agent Grid */}
      {filteredAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onView={onViewAgent}
              onDownload={onDownloadAgent}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)]">
          <p className="text-[#464554] font-medium">
            No agents found in this category
          </p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="mt-4 text-[#4648d4] hover:text-[#6063ee] font-semibold text-sm"
          >
            View all agents
          </button>
        </div>
      )}
    </div>
  )
}
