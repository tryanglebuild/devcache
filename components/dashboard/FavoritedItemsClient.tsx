'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Star, Loader2 } from 'lucide-react'
import { Tables } from '@/types/database.types'
import { trackActivity } from '@/lib/activity/track'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * FavoritedItemsClient — grid of project items the user has starred,
 * fetched from GET /api/dashboard/favorites. Clicking an item also
 * records a "view" activity event via trackActivity.
 */

type ProjectItem = Tables<'project_items'>

const PAGE_LIMIT = 6

export function FavoritedItemsClient() {
  const [items, setItems] = useState<ProjectItem[]>([])
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Fetches a single page of favorited items
  const fetchPage = useCallback(async (pageNum: number) => {
    const res = await fetch(`/api/dashboard/favorites?page=${pageNum}&limit=${PAGE_LIMIT}`)
    if (!res.ok) throw new Error('Failed to fetch favorites')
    return res.json() as Promise<{ items: ProjectItem[]; pagination: { hasNextPage: boolean } }>
  }, [])

  useEffect(() => {
    // cancelled flag prevents state updates after the component unmounts
    let cancelled = false
    setIsLoading(true)
    fetchPage(1)
      .then((data) => {
        if (cancelled) return
        setItems(data.items)
        setHasNextPage(data.pagination.hasNextPage)
        setPage(1)
      })
      .catch(console.error)
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [fetchPage])

  // Appends the next page without replacing the current list
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: PAGE_LIMIT }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-surface-container p-4 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] dark:shadow-none dark:ring-1 dark:ring-white/[0.08]">
            <div className="flex items-start gap-3">
              <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-surface-container rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] dark:shadow-none dark:ring-1 dark:ring-white/[0.08]">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-50 dark:bg-yellow-400/10 flex items-center justify-center">
          <Star size={28} strokeWidth={1.5} className="text-yellow-400 fill-yellow-400" />
        </div>
        <p className="text-[#464554] dark:text-on-surface-variant font-medium">No favorite items yet</p>
      </div>
    )
  }

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item) => {
        const url = item.type === 'folder'
          ? `/dashboard/projects/${item.id}`
          : `/dashboard/projects/file/${item.id}`

        return (
          <Link
            key={item.id}
            href={url}
            onClick={() => trackActivity(item.id, 'view')}
            className="bg-white dark:bg-surface-container p-4 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] dark:shadow-none dark:ring-1 dark:ring-white/[0.08] hover:shadow-lg dark:hover:ring-white/[0.12] transition-all cursor-pointer text-left"
          >
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                item.type === 'folder' ? 'bg-[#4f46e5]/10 dark:bg-[#7c7ff5]/15 text-[#4f46e5] dark:text-[#7c7ff5]' : 'bg-[#575992]/10 dark:bg-[#8b8cc7]/15 text-[#575992] dark:text-[#a5a6e6]'
              }`}>
                <span className="material-symbols-outlined text-xl">
                  {item.type === 'folder' ? 'folder' : 'description'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-[#191c1e] dark:text-on-surface truncate">{item.name}</h4>
                  <span className="material-symbols-outlined text-[#904900] text-sm flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                </div>
                {item.description && (
                  <p className="text-xs text-[#464554] dark:text-on-surface-variant line-clamp-2">{item.description}</p>
                )}
                {item.language_tags && item.language_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.language_tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-[#f2f4f6] dark:bg-surface-container-high text-[#464554] dark:text-on-surface-variant rounded text-[10px] font-bold uppercase tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.language_tags.length > 3 && (
                      <span className="px-2 py-0.5 bg-[#f2f4f6] dark:bg-surface-container-high text-[#464554] dark:text-on-surface-variant rounded text-[10px] font-bold">
                        +{item.language_tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>

    {hasNextPage && (
      <button
        onClick={loadMore}
        disabled={isLoadingMore}
        className="w-full py-2.5 text-sm font-semibold text-indigo-600 dark:text-[#7c7ff5] hover:text-indigo-700 dark:hover:text-[#9b9ef8] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
      >
        {isLoadingMore ? <Loader2 size={14} className="animate-spin" /> : null}
        {isLoadingMore ? 'Loading...' : 'Load more'}
      </button>
    )}
    </>
  )
}
