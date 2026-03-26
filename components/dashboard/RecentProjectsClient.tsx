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
          className="w-full bg-white p-4 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] flex items-center gap-3 hover:shadow-lg transition-all cursor-pointer text-left"
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            item.type === 'folder' ? 'bg-[#4648d4]/10 text-[#4648d4]' : 'bg-[#575992]/10 text-[#575992]'
          }`}>
            <span className="material-symbols-outlined text-xl">
              {item.type === 'folder' ? 'folder' : 'description'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#191c1e] truncate">{item.name}</p>
            {item.description && (
              <p className="text-xs text-[#464554] truncate">{item.description}</p>
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
