'use client'

import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'
import { Tables } from '@/types/database.types'
import { trackActivity } from '@/lib/activity/track'

type ProjectItem = Tables<'project_items'>

interface FavoritedItemsClientProps {
  items: ProjectItem[]
}

export function FavoritedItemsClient({ items }: FavoritedItemsClientProps) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => handleItemClick(item)}
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
        </button>
      ))}
    </div>
  )
}
