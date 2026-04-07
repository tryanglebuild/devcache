'use client'

import { useState, useCallback } from 'react'
import { RecentProjectsClient } from '@/components/dashboard/RecentProjectsClient'
import { FavoritedItemsClient } from '@/components/dashboard/FavoritedItemsClient'
import { AgentStatsWidget } from '@/components/agents/AgentStatsWidget'
import { TrendingAgentsCarousel } from '@/components/agents/TrendingAgentsCarousel'
import { AgentMarketplaceSection } from '@/components/agents/AgentMarketplaceSection'
import { MyAgentsLibrary } from '@/components/agents/MyAgentsLibrary'
import { ModeToggle, DashboardMode } from '@/components/dashboard/ModeToggle'
import { Skeleton } from '@/components/ui/skeleton'

interface DashboardContentProps {
  displayName: string
  projectItems: any[]
  favoriteItems: any[]
  trendingAgents: any[]
  userAgents: any[]
  marketplaceStats?: any
  userStats?: any
  publicAgents: any[]
  recentActivity: any
  isLoadingLazy?: boolean
}

export function DashboardContent({
  displayName,
  projectItems,
  favoriteItems,
  trendingAgents,
  userAgents,
  marketplaceStats,
  userStats,
  publicAgents,
  recentActivity,
  isLoadingLazy = false
}: DashboardContentProps) {
  const [mode, setMode] = useState<DashboardMode>('unified')

  const handleModeChange = useCallback((newMode: DashboardMode) => {
    setMode(newMode)
  }, [])

  const showProjects = mode === 'projects' || mode === 'unified'
  const showAgents = mode === 'agents' || mode === 'unified'

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Header with Mode Toggle */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-[#191c1e] mb-2">
            Personal Overview
          </h2>
          <p className="text-[#464554] font-medium">
            Welcome back, {displayName}. Your workspace is synchronized.
          </p>
        </div>
        <ModeToggle onModeChange={handleModeChange} />
      </div>

      {/* Combined Stats - Projects + Agents */}
      {showAgents && (
        <section className="mb-12">
          <AgentStatsWidget
            marketplaceStats={marketplaceStats}
            userStats={userStats}
          />
        </section>
      )}

      {/* Trending Agents Section */}
      {showAgents && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-[#191c1e]">
                Trending Agents
              </h3>
              <p className="text-sm text-[#464554] mt-1">
                Popular agents from the community
              </p>
            </div>
            <a
              href="/marketplace"
              className="text-sm font-semibold text-[#4648d4] hover:underline"
            >
              View Marketplace →
            </a>
          </div>
          {isLoadingLazy ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)]">
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
                  <h3 className="text-xl font-bold tracking-tight">Agent Marketplace</h3>
                  <p className="text-sm text-[#464554] mt-1">
                    Discover AI agents for your workflow
                  </p>
                </div>
                <a
                  href="/marketplace"
                  className="text-sm font-semibold text-[#4648d4] hover:underline"
                >
                  Browse All
                </a>
              </div>
              {isLoadingLazy ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)]">
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
                <h3 className="text-xl font-bold tracking-tight">Recent Projects</h3>
                <a
                  href="/dashboard/projects"
                  className="text-sm font-semibold text-[#4648d4] hover:underline"
                >
                  View All Projects
                </a>
              </div>
              
              {projectItems && projectItems.length > 0 ? (
                <RecentProjectsClient items={projectItems} />
              ) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)]">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f2f4f6] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#464554] text-3xl">
                      folder_open
                    </span>
                  </div>
                  <p className="text-[#464554] font-medium mb-4">No projects yet</p>
                  <a
                    href="/dashboard/projects"
                    className="inline-block px-6 py-2.5 bg-gradient-to-br from-[#4648d4] to-[#6063ee] text-white rounded-lg font-bold text-sm shadow-lg shadow-[#4648d4]/20 hover:shadow-xl transition-all"
                  >
                    Create Your First Project
                  </a>
                </div>
              )}
            </section>
          )}

          {/* Favorited Items */}
          {showProjects && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold tracking-tight">Favorited Items</h3>
                <a
                  href="/dashboard/projects"
                  className="text-sm font-semibold text-[#4648d4] hover:underline"
                >
                  View All
                </a>
              </div>
              <FavoritedItemsClient items={favoriteItems} />
            </section>
          )}
        </div>

        {/* Right Column - My Agents & Activity */}
        <aside>
          <div className="sticky top-28 space-y-8">
            {/* My Agents Library */}
            {showAgents && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold tracking-tight">My Agents</h3>
                  <a
                    href="/dashboard/agents"
                    className="text-sm font-semibold text-[#4648d4] hover:underline"
                  >
                    View All
                  </a>
                </div>
                <MyAgentsLibrary agents={userAgents} compact />
              </div>
            )}

            {/* Recent Activity */}
            {showProjects && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold tracking-tight">Recent Activity</h3>
                  <button className="p-2 hover:bg-[#f2f4f6] rounded-lg transition-colors">
                    <span className="material-symbols-outlined">filter_list</span>
                  </button>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)]">
                  {isLoadingLazy ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start gap-3 p-3">
                          <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recentActivity && recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivity.map((activity: any) => {
                        const item = activity.project_items
                        if (!item) return null
                        
                        const timeAgo = new Date(activity.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                        
                        return (
                          <a
                            key={activity.id}
                            href={item.type === 'folder' ? `/dashboard/projects/${item.id}` : `/dashboard/projects/file/${item.id}`}
                            className="flex items-start gap-3 p-3 hover:bg-[#f7f9fb] rounded-lg transition-colors"
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              item.type === 'folder' ? 'bg-[#4648d4]/10 text-[#4648d4]' : 'bg-[#575992]/10 text-[#575992]'
                            }`}>
                              <span className="material-symbols-outlined text-sm">
                                {item.type === 'folder' ? 'folder' : 'description'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#191c1e] truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-[#464554]">{timeAgo}</p>
                            </div>
                          </a>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#f2f4f6] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#464554]">
                          history
                        </span>
                      </div>
                      <p className="text-sm text-[#464554]">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* System Status */}
            <div className="p-6 bg-[#f2f4f6] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-[#464554] uppercase tracking-wider">
                  System Operational
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#464554] opacity-60">
                v2.0.0
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
