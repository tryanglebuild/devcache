'use client'

import { ChevronRight, Home } from 'lucide-react'
import { Tables } from '@/types/database.types'

type ProjectItem = Tables<'project_items'>

interface BreadcrumbProps {
  items: ProjectItem[]
  onNavigate: (index: number) => void
}

export function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-6">
      <button
        onClick={() => onNavigate(-1)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#f2f4f6] transition-colors text-[#464554] hover:text-[#191c1e]"
      >
        <Home className="h-4 w-4" />
        <span className="font-semibold">Projects</span>
      </button>

      {items.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-[#c7c4d7]" />
          <button
            onClick={() => onNavigate(index)}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
              index === items.length - 1
                ? 'text-[#4648d4] bg-[#4648d4]/10'
                : 'text-[#464554] hover:bg-[#f2f4f6] hover:text-[#191c1e]'
            }`}
          >
            {item.name}
          </button>
        </div>
      ))}
    </nav>
  )
}
