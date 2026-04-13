'use client'

import { useState, useCallback } from 'react'
import { FolderOpen } from 'lucide-react'
import { RecentProjectsClient } from '@/components/dashboard/RecentProjectsClient'
import { FavoritedItemsClient } from '@/components/dashboard/FavoritedItemsClient'
import { RecentActivityClient } from '@/components/dashboard/RecentActivityClient'
import { TrendingAgentsCarousel } from '@/components/agents/TrendingAgentsCarousel'
import { AgentMarketplaceSection } from '@/components/agents/AgentMarketplaceSection'
import { ModeToggle, DashboardMode } from '@/components/dashboard/ModeToggle'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * DashboardContent — the main layout of the dashboard.
 * Renders different sections depending on the selected mode:
 *   - 'agents'   → Trending Agents + Agent Marketplace
 *   - 'projects' → Recent Projects + Favorited Items
 *   - 'unified'  → all sections visible at once
 *
 * Lazy data (trending/public agents) is received as props and shows
 * skeleton placeholders while isLoadingLazy is true.
 */

interface DashboardContentProps {
  displayName: string
  trendingAgents: any[]
  userAgents: any[]
  marketplaceStats?: any
  userStats?: any
  publicAgents: any[]
  isLoadingLazy?: boolean
}

export function DashboardContent({
  displayName,
  trendingAgents,
  userAgents,
  marketplaceStats,
  userStats,
  publicAgents,
  isLoadingLazy = false
}: DashboardContentProps) {
  // Controls which sections are visible (agents / projects / unified)
  const [mode, setMode] = useState<DashboardMode>('agents')

  const handleModeChange = useCallback((newMode: DashboardMode) => {
    setMode(newMode)
  }, [])

  // Derived flags used to conditionally render the correct sections
  const showProjects = mode === 'projects' || mode === 'unified'
  const showAgents = mode === 'agents' || mode === 'unified'

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Header with Mode Toggle */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-on-surface mb-2">
            Your cache, {displayName}.
          </h2>
        </div>
        <ModeToggle onModeChange={handleModeChange} />
      </div>

      {/* Trending Agents Section */}
      {showAgents && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="w-1 h-5 bg-indigo-500 rounded-full" />
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-on-surface">
                  Trending Agents
                </h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-on-surface-variant mt-1">
                Popular agents from the community
              </p>
            </div>
            <a
              href="/marketplace"
              className="text-sm font-semibold text-indigo-600 dark:text-[#7c7ff5] hover:underline"
            >
              View Marketplace →
            </a>
          </div>
          {isLoadingLazy ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-surface-container p-6 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] dark:shadow-none dark:ring-1 dark:ring-white/[0.08]">
                  <Skeleton className="h-32 w-full mb-4" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : trendingAgents.length > 0 ? (
            <TrendingAgentsCarousel agents={trendingAgents} />
          ) : null}
        </section>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column - Marketplace & Projects */}
        <div className="lg:col-span-2 space-y-12">
          {/* Agent Marketplace Preview */}
          {showAgents && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="w-1 h-5 bg-indigo-500 rounded-full" />
                    <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-on-surface">Agent Marketplace</h3>
                  </div>
                   <p className="text-sm text-slate-500 dark:text-on-surface-variant mt-1">
                    Discover AI agents for your workflow
                  </p>
                </div>
                <a
                  href="/marketplace"
                  className="text-sm font-semibold text-indigo-600 dark:text-[#7c7ff5] hover:underline"
                >
                  Browse All
                </a>
              </div>
              {isLoadingLazy ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white dark:bg-surface-container p-6 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] dark:shadow-none dark:ring-1 dark:ring-white/[0.08]">
                      <Skeleton className="h-24 w-full mb-4" />
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : publicAgents.length > 0 ? (
                <AgentMarketplaceSection
                  agents={publicAgents}
                  showFilters={false}
                />
              ) : null}
            </section>
          )}

          {/* Recent Projects */}
          {showProjects && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-1 h-5 bg-indigo-500 rounded-full" />
                  <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-on-surface">Recent Projects</h3>
                </div>
                <a
                  href="/dashboard/projects"
                  className="text-sm font-semibold text-indigo-600 dark:text-[#7c7ff5] hover:underline"
                >
                  View All Projects
                </a>
              </div>
              
              <RecentProjectsClient />
            </section>
          )}

          {/* Favorited Items */}
          {showProjects && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-on-surface">Favorited Items</h3>
                <a
                  href="/dashboard/projects"
                  className="text-sm font-semibold text-indigo-600 dark:text-[#7c7ff5] hover:underline"
                >
                  View All
                </a>
              </div>
              <FavoritedItemsClient />
            </section>
          )}
        </div>

        {/* Right Column - My Agents & Activity */}
        <aside>
          <div className="sticky top-28 space-y-8">
            {/* Recent Activity */}
            <RecentActivityClient />

            {/* System Status */}
            <div className="p-6 bg-slate-100 dark:bg-surface-container rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-slate-500 dark:text-on-surface-variant uppercase tracking-wider">
                  System Operational
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-on-surface-variant opacity-60">
                v2.0.0
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
