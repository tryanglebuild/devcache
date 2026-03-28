'use client'

import { useState } from 'react'
import { AgentCard } from './AgentCard'
import type { AgentTemplateWithStats } from '@/types/agents.types'
import { Star, Clock, Download } from 'lucide-react'

interface MyAgentsLibraryProps {
  agents: AgentTemplateWithStats[]
  onViewAgent?: (agent: AgentTemplateWithStats) => void
  onExecuteAgent?: (agent: AgentTemplateWithStats) => void
  compact?: boolean
}

type LibraryView = 'all' | 'favorites' | 'recent'

export function MyAgentsLibrary({
  agents,
  onViewAgent,
  onExecuteAgent,
  compact = false
}: MyAgentsLibraryProps) {
  const [view, setView] = useState<LibraryView>('all')

  const filteredAgents = agents.filter((agent) => {
    if (view === 'favorites') return agent.is_favorite
    if (view === 'recent') return true // TODO: Add recent logic
    return true
  })

  const views = [
    { id: 'all' as LibraryView, label: 'All', icon: Download },
    { id: 'favorites' as LibraryView, label: 'Favorites', icon: Star },
    { id: 'recent' as LibraryView, label: 'Recent', icon: Clock }
  ]

  if (!agents || agents.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)]">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#f2f4f6] flex items-center justify-center">
          <span className="material-symbols-outlined text-[#464554] text-2xl">
            inventory_2
          </span>
        </div>
        <p className="text-sm text-[#464554] font-medium mb-3">
          No agents in your library
        </p>
        <a
          href="/marketplace"
          className="inline-block px-4 py-2 bg-[#4648d4] text-white rounded-lg font-semibold text-sm hover:bg-[#6063ee] transition-colors"
        >
          Browse Marketplace
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* View Tabs */}
      {!compact && (
        <div className="flex items-center gap-2 border-b border-[#c7c4d7]/10 pb-3">
          {views.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                view === id
                  ? 'bg-[#4648d4] text-white'
                  : 'text-[#464554] hover:bg-[#f2f4f6]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Agent List */}
      {filteredAgents.length > 0 ? (
        <div className={compact ? 'space-y-3' : 'grid grid-cols-1 gap-4'}>
          {filteredAgents.slice(0, compact ? 5 : undefined).map((agent) => (
            <div key={agent.id}>
              {compact ? (
                <button
                  onClick={() => onViewAgent?.(agent)}
                  className="w-full bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: '#4648d415',
                        color: '#4648d4'
                      }}
                    >
                      <span className="material-symbols-outlined text-sm">
                        smart_toy
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#191c1e] truncate">
                        {agent.name}
                      </p>
                      <p className="text-xs text-[#464554] truncate">
                        {agent.category}
                      </p>
                    </div>
                    {agent.is_favorite && (
                      <Star className="w-4 h-4 fill-[#904900] text-[#904900] flex-shrink-0" />
                    )}
                  </div>
                </button>
              ) : (
                <AgentCard
                  agent={agent}
                  onView={onViewAgent}
                  onDownload={onExecuteAgent}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm">
          <p className="text-sm text-[#464554]">
            No {view === 'favorites' ? 'favorite' : view} agents
          </p>
        </div>
      )}

      {/* View All Link */}
      {compact && agents.length > 5 && (
        <a
          href="/dashboard/agents"
          className="block text-center text-sm font-semibold text-[#4648d4] hover:text-[#6063ee] transition-colors"
        >
          View all {agents.length} agents →
        </a>
      )}
    </div>
  )
}
