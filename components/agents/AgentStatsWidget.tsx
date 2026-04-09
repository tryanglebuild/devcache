'use client'

import type { MarketplaceStats, UserAgentStats } from '@/types/agents.types'

interface AgentStatsWidgetProps {
  marketplaceStats?: MarketplaceStats
  userStats?: UserAgentStats
  loading?: boolean
}

export function AgentStatsWidget({ marketplaceStats, userStats, loading }: AgentStatsWidgetProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#f2f4f6]" />
              <div className="flex-1">
                <div className="h-3 bg-[#f2f4f6] rounded w-20 mb-2" />
                <div className="h-6 bg-[#f2f4f6] rounded w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const stats = [
    {
      icon: 'smart_toy',
      label: 'Total Agents',
      value: marketplaceStats?.total_agents || 0,
      color: '#6b7280',
      bgColor: '#6b7280'
    },
    {
      icon: 'download',
      label: 'Downloads',
      value: userStats?.total_downloads || 0,
      color: '#6b7280',
      bgColor: '#6b7280'
    },
    {
      icon: 'play_arrow',
      label: 'Executions',
      value: userStats?.total_executions || 0,
      color: '#6b7280',
      bgColor: '#6b7280'
    },
    {
      icon: 'star',
      label: 'Avg Rating',
      value: userStats?.average_rating?.toFixed(1) || '0.0',
      color: '#6b7280',
      bgColor: '#6b7280',
      isFilled: true
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${stat.bgColor}15`, color: stat.color }}
            >
              <span 
                className="material-symbols-outlined"
                style={{ fontVariationSettings: stat.isFilled ? "'FILL' 1" : undefined }}
              >
                {stat.icon}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#464554] uppercase tracking-widest">
                {stat.label}
              </p>
              <p className="text-2xl font-black text-[#191c1e]">
                {typeof stat.value === 'number' && stat.value > 999
                  ? `${(stat.value / 1000).toFixed(1)}k`
                  : stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
