'use client'

import { useState, useCallback } from 'react'
import { FolderOpen, Folder, FileText, Clock, SlidersHorizontal } from 'lucide-react'
import { RecentProjectsClient } from '@/components/dashboard/RecentProjectsClient'
import { FavoritedItemsClient } from '@/components/dashboard/FavoritedItemsClient'
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
  const [mode, setMode] = useState<DashboardMode>('agents')

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
              
              {projectItems && projectItems.length > 0 ? (
                <RecentProjectsClient items={projectItems} />
              ) : (
                <div className="text-center py-12 bg-white dark:bg-surface-container rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] dark:shadow-none dark:ring-1 dark:ring-white/[0.08]">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-50 dark:bg-[#7c7ff5]/15 flex items-center justify-center">
                    <FolderOpen size={32} strokeWidth={1.5} className="text-indigo-400" />
                  </div>
                  <p className="text-slate-500 dark:text-on-surface-variant font-medium mb-4">No projects yet</p>
                  <a
                    href="/dashboard/projects"
                    className="inline-block px-6 py-2.5 bg-gradient-to-br from-[#4f46e5] to-[#4338ca] text-white rounded-lg font-bold text-sm shadow-lg shadow-[#4f46e5]/20 dark:shadow-[#7c7ff5]/10 hover:shadow-xl transition-all"
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
                <h3 className="text-lg font-semibold text-slate-700 dark:text-on-surface">Favorited Items</h3>
                <a
                  href="/dashboard/projects"
                  className="text-sm font-semibold text-indigo-600 dark:text-[#7c7ff5] hover:underline"
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
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-on-surface">My Agents</h3>
                  <a
                    href="/dashboard/agents"
                    className="text-sm font-semibold text-indigo-600 dark:text-[#7c7ff5] hover:underline"
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
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-on-surface">Recent Activity</h3>
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-surface-container-high rounded-lg transition-colors">
                    <SlidersHorizontal size={16} strokeWidth={1.5} />
                  </button>
                </div>
                
                <div className="bg-white dark:bg-surface-container p-6 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] dark:shadow-none dark:ring-1 dark:ring-white/[0.08]">
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
                            className="flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-surface-container-high rounded-lg transition-colors"
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              item.type === 'folder' ? 'bg-indigo-600/10 text-indigo-600' : 'bg-indigo-500/10 text-indigo-500'
                            }`}>
                              {item.type === 'folder'
                                ? <Folder size={14} strokeWidth={1.5} />
                                : <FileText size={14} strokeWidth={1.5} />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 dark:text-on-surface truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-on-surface-variant">{timeAgo}</p>
                            </div>
                          </a>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-50 dark:bg-amber-400/10 flex items-center justify-center">
                        <Clock size={20} strokeWidth={1.5} className="text-amber-400" />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-on-surface-variant">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            )}

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
