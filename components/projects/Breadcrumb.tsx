'use client'

import Link from 'next/link'
import { FolderKanban, ChevronRight } from 'lucide-react'
import {
  Breadcrumb as BreadcrumbRoot,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Tables } from '@/types/database.types'

type ProjectItem = Tables<'project_items'>

interface BreadcrumbProps {
  items: ProjectItem[]
  currentPage?: string
}

export function Breadcrumb({ items, currentPage }: BreadcrumbProps) {
  return (
    <BreadcrumbRoot className="mb-6">
      <BreadcrumbList>
        {/* Home / Projects */}
        <BreadcrumbItem>
          <BreadcrumbLink 
            href="/dashboard/projects"
            className="flex items-center gap-2 text-[#464554] hover:text-[#4f46e5] transition-colors"
          >
            <FolderKanban className="h-4 w-4" />
            <span className="font-semibold">Projects</span>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Path items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1 && !currentPage
          const href = item.type === 'folder' 
            ? `/dashboard/projects/${item.id}`
            : `/dashboard/projects/file/${item.id}`

          return (
            <div key={item.id} className="flex items-center gap-2">
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-semibold text-[#4f46e5]">
                    {item.name}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink 
                    href={href}
                    className="font-semibold text-[#464554] hover:text-[#4f46e5] transition-colors"
                  >
                    {item.name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          )
        })}

        {/* Current page (if provided) */}
        {currentPage && (
          <div className="flex items-center gap-2">
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-[#4f46e5]">
                {currentPage}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </div>
        )}
      </BreadcrumbList>
    </BreadcrumbRoot>
  )
}
