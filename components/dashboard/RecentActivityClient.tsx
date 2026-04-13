'use client'

import { useState, useEffect, useCallback } from 'react'
import { Clock, Store, Folder, FileText, Eraser, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * RecentActivityClient — sidebar widget that displays the user's recent
 * interactions (project views, agent opens, etc.) fetched from GET /api/activity.
 * Supports paginated "Load more" and a "Clear history" action.
 */

// Shape of each row returned by the activity API
interface ActivityEntry {
  id: string
  action_type: string
  created_at: string
  project_items: { id: string; name: string; type: string; description: string } | null
  agent_templates: { id: string; name: string; category: string; description: string } | null
}

const PAGE_LIMIT = 10

export function RecentActivityClient() {
  const [items, setItems] = useState<ActivityEntry[]>([])
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  // Fetches a single page from the activity API
  const fetchPage = useCallback(async (pageNum: number) => {
    const res = await fetch(`/api/activity?page=${pageNum}&limit=${PAGE_LIMIT}`)
    if (!res.ok) throw new Error('Failed to fetch activity')
    return res.json() as Promise<{ items: ActivityEntry[]; pagination: { hasNextPage: boolean } }>
  }, [])

  // Resets to page 1 and replaces current items
  const loadInitial = useCallback(() => {
    setIsLoading(true)
    fetchPage(1)
      .then((data) => {
        setItems(data.items)
        setHasNextPage(data.pagination.hasNextPage)
        setPage(1)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [fetchPage])

  useEffect(() => {
    loadInitial()
  }, [loadInitial])

  // Appends the next page of results to the existing list
  const loadMore = async () => {
    setIsLoadingMore(true)
    try {
      const nextPage = page + 1
      const data = await fetchPage(nextPage)
      setItems((prev) => [...prev, ...data.items])
      setHasNextPage(data.pagination.hasNextPage)
      setPage(nextPage)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Calls DELETE /api/activity/clear and resets the local list
  const handleClearActivity = async () => {
    setIsClearing(true)
    try {
      const res = await fetch('/api/activity/clear', { method: 'DELETE' })
      if (res.ok) {
        setItems([])
        setHasNextPage(false)
        toast.success('Activity history cleared')
      } else {
        toast.error('Failed to clear activity')
      }
    } catch {
      toast.error('Failed to clear activity')
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-on-surface">Recent Activity</h3>
        <button
          onClick={handleClearActivity}
          disabled={isClearing || items.length === 0}
          className="p-2 hover:bg-slate-100 dark:hover:bg-surface-container-high rounded-lg transition-colors text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Clear history"
        >
          <Eraser size={15} strokeWidth={1.5} />
        </button>
      </div>

      <div className="bg-white dark:bg-surface-container p-6 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] dark:shadow-none dark:ring-1 dark:ring-white/[0.08]">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3">
                <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-50 dark:bg-amber-400/10 flex items-center justify-center">
              <Clock size={20} strokeWidth={1.5} className="text-amber-400" />
            </div>
            <p className="text-sm text-slate-500 dark:text-on-surface-variant">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((activity) => {
              const item = activity.project_items
              const agent = activity.agent_templates
              const entry = item || agent
              if (!entry) return null

              const isAgent = !!agent
              const href = isAgent
                ? `/marketplace/${entry.id}`
                : item!.type === 'folder'
                  ? `/dashboard/projects/${entry.id}`
                  : `/dashboard/projects/file/${entry.id}`

              const timeAgo = new Date(activity.created_at).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })

              return (
                <a
                  key={activity.id}
                  href={href}
                  className="flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-surface-container-high rounded-lg transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isAgent
                      ? 'bg-violet-500/10 text-violet-500'
                      : item!.type === 'folder'
                        ? 'bg-indigo-600/10 text-indigo-600'
                        : 'bg-indigo-500/10 text-indigo-500'
                  }`}>
                    {isAgent
                      ? <Store size={14} strokeWidth={1.5} />
                      : item!.type === 'folder'
                        ? <Folder size={14} strokeWidth={1.5} />
                        : <FileText size={14} strokeWidth={1.5} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-on-surface truncate">
                      {entry.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-on-surface-variant">{timeAgo}</p>
                  </div>
                </a>
              )
            })}

            {hasNextPage && (
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="w-full py-2 text-xs font-semibold text-indigo-600 dark:text-[#7c7ff5] hover:text-indigo-700 dark:hover:text-[#9b9ef8] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {isLoadingMore ? <Loader2 size={12} className="animate-spin" /> : null}
                {isLoadingMore ? 'Loading...' : 'Load more'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
