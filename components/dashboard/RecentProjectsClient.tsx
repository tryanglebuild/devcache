'use client'

import { useRouter } from 'next/navigation'
import { Tables } from '@/types/database.types'
import { trackActivity } from '@/lib/activity/track'

type ProjectItem = Tables<'project_items'>

interface RecentProjectsClientProps {
  items: ProjectItem[]
}

export function RecentProjectsClient({ items }: RecentProjectsClientProps) {
  const router = useRouter()

  const handleItemClick = async (item: ProjectItem) => {
    // Track activity
    await trackActivity(item.id, 'view')
    
    // Navigate
    const url = item.type === 'folder' 
      ? `/dashboard/projects/${item.id}` 
      : `/dashboard/projects/file/${item.id}`
    router.push(url)
  }

  return (
    <div className="space-y-3">
      {items.slice(0, 5).map((item) => (
        <button
          key={item.id}
          onClick={() => handleItemClick(item)}
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
        </button>
      ))}
    </div>
  )
}
