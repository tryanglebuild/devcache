'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Loader2, FolderOpen } from 'lucide-react'
import { Tables } from '@/types/database.types'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * RecentProjectsClient — shows the most recently updated project items
 * (folders and files) for the current user, fetched from
 * GET /api/dashboard/projects. Supports "Load more" pagination.
 */

type ProjectItem = Tables<'project_items'>

const PAGE_LIMIT = 5

export function RecentProjectsClient() {
  const [items, setItems] = useState<ProjectItem[]>([])
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Fetches a single page from the projects API
  const fetchPage = useCallback(async (pageNum: number) => {
    const res = await fetch(`/api/dashboard/projects?page=${pageNum}&limit=${PAGE_LIMIT}`)
    if (!res.ok) throw new Error('Failed to fetch projects')
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
      <div className="space-y-3">
        {Array.from({ length: PAGE_LIMIT }).map((_, i) => (
          <div key={i} className="w-full bg-white dark:bg-surface-container p-4 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] dark:shadow-none dark:ring-1 dark:ring-white/[0.08] flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
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
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const url = item.type === 'folder'
          ? `/dashboard/projects/${item.id}`
          : `/dashboard/projects/file/${item.id}`

        return (
          <Link
            key={item.id}
            href={url}
            className="w-full bg-white dark:bg-surface-container p-4 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] dark:shadow-none dark:ring-1 dark:ring-white/[0.08] flex items-center gap-3 hover:shadow-lg dark:hover:ring-white/[0.12] transition-all cursor-pointer text-left"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              item.type === 'folder' ? 'bg-[#4f46e5]/10 dark:bg-[#7c7ff5]/15 text-[#4f46e5] dark:text-[#7c7ff5]' : 'bg-[#575992]/10 dark:bg-[#8b8cc7]/15 text-[#575992] dark:text-[#a5a6e6]'
            }`}>
              <span className="material-symbols-outlined text-xl">
                {item.type === 'folder' ? 'folder' : 'description'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#191c1e] dark:text-on-surface truncate">{item.name}</p>
              {item.description && (
                <p className="text-xs text-[#464554] dark:text-on-surface-variant truncate">{item.description}</p>
              )}
            </div>
            {item.is_favorite && (
              <span className="material-symbols-outlined text-[#904900] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
            )}
          </Link>
        )
      })}

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
    </div>
  )
}
