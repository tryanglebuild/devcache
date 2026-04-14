'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Star, Loader2, Folder, FileText } from 'lucide-react'
import { Tables } from '@/types/database.types'
import { trackActivity } from '@/lib/activity/track'

/**
 * FavoritedItemsClient — grid of project items the user has starred,
 * fetched from GET /api/dashboard/favorites.
 */

type ProjectItem = Tables<'project_items'>

const PAGE_LIMIT = 12

export function FavoritedItemsClient() {
  const [items, setItems] = useState<ProjectItem[]>([])
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const fetchPage = useCallback(async (pageNum: number) => {
    const res = await fetch(`/api/dashboard/favorites?page=${pageNum}&limit=${PAGE_LIMIT}`)
    if (!res.ok) throw new Error('Failed to fetch favorites')
    return res.json() as Promise<{ items: ProjectItem[]; pagination: { hasNextPage: boolean } }>
  }, [])

  useEffect(() => {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: PAGE_LIMIT }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-lg p-4 animate-pulse"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-surface-container-high" />
              <div className="flex-1">
                <div className="h-3.5 bg-neutral-100 dark:bg-surface-container-high rounded w-3/4 mb-2" />
                <div className="h-3 bg-neutral-100 dark:bg-surface-container-high rounded w-1/2" />
              </div>
            </div>
            <div className="h-3 bg-neutral-100 dark:bg-surface-container-high rounded w-full mb-2" />
            <div className="h-3 bg-neutral-100 dark:bg-surface-container-high rounded w-5/6" />
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-neutral-50 dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-lg p-10 text-center">
        <Star size={24} strokeWidth={1.5} className="mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">No favorites yet</p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          Star projects and files to find them here quickly
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const url = item.type === 'folder'
            ? `/dashboard/projects/${item.id}`
            : `/dashboard/projects/file/${item.id}`

          return (
            <Link
              key={item.id}
              href={url}
              onClick={() => trackActivity(item.id, 'view')}
              className="bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-lg p-4 hover:border-neutral-400 dark:hover:border-white/20 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-surface-container-high flex items-center justify-center flex-shrink-0">
                    {item.type === 'folder'
                      ? <Folder size={16} strokeWidth={1.5} className="text-neutral-500 dark:text-neutral-400" />
                      : <FileText size={16} strokeWidth={1.5} className="text-neutral-500 dark:text-neutral-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                      {item.name}
                    </h3>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-surface-container-high text-neutral-400 dark:text-neutral-500">
                      {item.type === 'folder' ? 'Folder' : 'File'}
                    </span>
                  </div>
                </div>
                {/* Star indicator */}
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1" title="Favorited" />
              </div>

              {item.description && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 line-clamp-2">
                  {item.description}
                </p>
              )}

              {item.language_tags && item.language_tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.language_tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="text-[10px] bg-neutral-100 dark:bg-surface-container-high text-neutral-400 dark:text-neutral-500 px-1.5 py-0.5 rounded font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.language_tags.length > 3 && (
                    <span className="text-[10px] bg-neutral-100 dark:bg-surface-container-high text-neutral-400 dark:text-neutral-500 px-1.5 py-0.5 rounded font-medium">
                      +{item.language_tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </Link>
          )
        })}
      </div>

      {hasNextPage && (
        <div className="mt-6 text-center">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="px-4 py-2 bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-md text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-surface-container-high disabled:opacity-50 flex items-center gap-2 mx-auto transition-colors"
          >
            {isLoadingMore && <Loader2 size={12} className="animate-spin" />}
            {isLoadingMore ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </>
  )
}
