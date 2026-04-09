'use client'

import type { MarketplaceStats } from '@/types/agents.types'
import { TrendingUp, Users, Download, Star } from 'lucide-react'

interface MarketplaceHeroProps {
  stats: MarketplaceStats | null
}

export function MarketplaceHero({ stats }: MarketplaceHeroProps) {
  const statItems = [
    {
      icon: TrendingUp,
      label: 'Total Agents',
      value: stats?.total_agents || 0,
      color: '#4f46e5'
    },
    {
      icon: Users,
      label: 'Contributors',
      value: stats?.total_creators || 0,
      color: '#10b981'
    },
    {
      icon: Download,
      label: 'Downloads',
      value: stats?.total_downloads || 0,
      color: '#0891b2'
    },
    {
      icon: Star,
      label: 'Avg Rating',
      value: stats?.average_rating?.toFixed(1) || '0.0',
      color: '#fbbf24'
    }
  ]

  return (
    <div className="mb-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-black tracking-tight text-[#191c1e] dark:text-on-surface mb-4">
          Agent Marketplace
        </h1>
        <p className="text-lg text-[#464554] dark:text-on-surface-variant max-w-2xl mx-auto">
          Discover, download, and deploy specialized AI agents created by the community.
          Accelerate your development workflow with expert knowledge.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="bg-white dark:bg-surface-container rounded-xl p-6 shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/[0.08] dark:hover:ring-white/[0.12] hover:shadow-md transition-all"
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <p className="text-3xl font-black text-[#191c1e] dark:text-on-surface mb-1">
                  {typeof stat.value === 'number' && stat.value > 999
                    ? `${(stat.value / 1000).toFixed(1)}k`
                    : stat.value}
                </p>
                <p className="text-xs font-bold text-[#464554] dark:text-on-surface-variant uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
