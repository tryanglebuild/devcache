'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createContext, useContext, useState, ReactNode } from 'react'
import {
  LayoutDashboard,
  FolderKanban,
  Tag,
  ChevronLeft,
  ChevronRight,
  Folder,
  FileText,
  Store,
  Trash2,
  FileCode,
} from 'lucide-react'
import { useCreateItem } from '@/components/providers/CreateItemProvider'
import { SidebarProjectsTree } from '@/components/dashboard/SidebarProjectsTree'
import { cn } from '@/lib/utils'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Marketplace',
    href: '/marketplace',
    icon: Store,
  },
  {
    title: 'My Templates',
    href: '/dashboard/my-templates',
    icon: FileCode,
  },
  // Projects is now handled by SidebarProjectsTree
  {
    title: 'Tags',
    href: '/dashboard/tags',
    icon: Tag,
  },
  {
    title: 'Deleted',
    href: '/dashboard/deleted-templates',
    icon: Trash2,
  },
]

// Context to share sidebar state
const SidebarContext = createContext<{
  isCollapsed: boolean
  setIsCollapsed: (value: boolean) => void
}>({
  isCollapsed: false,
  setIsCollapsed: () => {},
})

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebarContext() {
  return useContext(SidebarContext)
}

export function DashboardSidebar() {
  const pathname = usePathname() || '/dashboard'
  const { isCollapsed, setIsCollapsed } = useSidebarContext()
  const { openCreateModal } = useCreateItem()

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen bg-[#f2f4f6] border-r border-[#c7c4d7]/20
        transition-all duration-300 ease-in-out z-50
        ${isCollapsed ? 'w-[72px]' : 'w-64'}
      `}
    >
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-[#c7c4d7]/20">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#4648d4] to-[#6063ee] flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0">
            DC
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-[#191c1e] tracking-tighter leading-none">
                devCache
              </h1>
              <p className="text-[9px] font-medium uppercase tracking-widest text-[#464554] opacity-60 mt-0.5">
                Engineering Hub
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 w-6 h-6 bg-white border border-[#c7c4d7]/30 rounded-full flex items-center justify-center text-[#464554] hover:text-[#4648d4] hover:border-[#4648d4] transition-colors shadow-sm"
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {/* Quick Actions */}
        {!isCollapsed ? (
          <div className="flex gap-2 mb-4 pb-4 border-b border-[#c7c4d7]/20">
            <button
              onClick={() => openCreateModal('folder')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-all bg-white border border-[#c7c4d7]/30 text-[#4648d4] hover:bg-[#4648d4]/5 shadow-sm"
              title="New Folder"
            >
              <Folder className="h-4 w-4 shrink-0" />
              <span className="text-xs font-bold">Folder</span>
            </button>
            <button
              onClick={() => openCreateModal('file')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-all bg-white border border-[#c7c4d7]/30 text-[#575992] hover:bg-[#575992]/5 shadow-sm"
              title="New File"
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span className="text-xs font-bold">File</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2 mb-4 pb-4 border-b border-[#c7c4d7]/20">
            <button
              onClick={() => openCreateModal('folder')}
              className="w-full flex items-center justify-center p-2.5 rounded-lg transition-all bg-white border border-[#c7c4d7]/30 text-[#4648d4] hover:bg-[#4648d4]/5 shadow-sm"
              title="New Folder"
            >
              <Folder className="h-5 w-5" />
            </button>
            <button
              onClick={() => openCreateModal('file')}
              className="w-full flex items-center justify-center p-2.5 rounded-lg transition-all bg-white border border-[#c7c4d7]/30 text-[#575992] hover:bg-[#575992]/5 shadow-sm"
              title="New File"
            >
              <FileText className="h-5 w-5" />
            </button>
          </div>
        )}

        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                ${isCollapsed ? 'justify-center' : ''}
                ${
                  isActive
                    ? 'bg-white text-[#4648d4] shadow-sm font-bold'
                    : 'text-[#464554] hover:text-[#191c1e] hover:bg-[#e0e3e5]'
                }
              `}
              title={isCollapsed ? item.title : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium uppercase tracking-wider">
                  {item.title}
                </span>
              )}
            </Link>
          )
        })}

        {/* Projects Tree */}
        {!isCollapsed ? (
          <SidebarProjectsTree isCollapsed={isCollapsed} />
        ) : (
          <Link
            href="/dashboard/projects"
            className={cn(
              'flex items-center justify-center px-3 py-2.5 rounded-lg transition-all',
              pathname?.startsWith('/dashboard/projects')
                ? 'bg-white text-[#4648d4] shadow-sm font-bold'
                : 'text-[#464554] hover:text-[#191c1e] hover:bg-[#e0e3e5]'
            )}
            title="Projects"
          >
            <FolderKanban className="h-5 w-5 shrink-0" />
          </Link>
        )}
      </nav>
    </aside>
  )
}
