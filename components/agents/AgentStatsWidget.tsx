'use client'

import { Bot, Download, Play, Star } from 'lucide-react'
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
          <div key={i} className="bg-white dark:bg-surface-container p-6 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] dark:shadow-none dark:ring-1 dark:ring-white/[0.08] animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-surface-container-high" />
              <div className="flex-1">
                <div className="h-3 bg-slate-100 dark:bg-surface-container-high rounded w-20 mb-2" />
                <div className="h-6 bg-slate-100 dark:bg-surface-container-high rounded w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const stats = [
    {
      icon: Bot,
      label: 'Total Agents',
      value: marketplaceStats?.total_agents || 0,
      color: '#4f46e5',
      bgColor: '#4f46e5'
    },
    {
      icon: Download,
      label: 'Downloads',
      value: userStats?.total_downloads || 0,
      color: '#0891b2',
      bgColor: '#0891b2'
    },
    {
      icon: Play,
      label: 'Executions',
      value: userStats?.total_executions || 0,
      color: '#059669',
      bgColor: '#059669'
    },
    {
      icon: Star,
      label: 'Avg Rating',
      value: userStats?.average_rating?.toFixed(1) || '0.0',
      color: '#d97706',
      bgColor: '#d97706',
      isFilled: true
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className="bg-white dark:bg-surface-container p-6 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] dark:shadow-none dark:ring-1 dark:ring-white/[0.08] hover:shadow-lg dark:hover:ring-white/[0.12] transition-all">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${stat.bgColor}15`, color: stat.color }}
              >
                <Icon size={22} strokeWidth={1.5} style={stat.isFilled ? { fill: 'currentColor' } : undefined} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#464554] dark:text-on-surface-variant uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-[#191c1e] dark:text-on-surface">
                  {typeof stat.value === 'number' && stat.value > 999
                    ? `${(stat.value / 1000).toFixed(1)}k`
                    : stat.value}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
