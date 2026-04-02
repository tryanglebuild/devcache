'use client'

import { ReactNode } from 'react'
import { useSidebarContext } from '@/components/dashboard-sidebar'

export function SupportDetailsContent({ children }: { children: ReactNode }) {
  const { isCollapsed } = useSidebarContext()
  
  return (
    <div className={`min-h-screen bg-slate-50 transition-all duration-300 ${isCollapsed ? 'ml-[72px]' : 'ml-64'}`}>
      {children}
    </div>
  )
}
