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
  Plus,
  Sparkles,
  Settings,
} from 'lucide-react'
import { useCreateItem } from '@/components/providers/CreateItemProvider'
import { SidebarProjectsTree } from '@/components/dashboard/SidebarProjectsTree'
import { cn } from '@/lib/utils'

const mainMenuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Marketplace',
    href: '/marketplace',
    icon: Store,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
]

const workspaceItems = [
  {
    title: 'My Templates',
    href: '/dashboard/my-templates',
    icon: FileCode,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    title: 'Tags',
    href: '/dashboard/tags',
    icon: Tag,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
]

const bottomMenuItems = [
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
  {
    title: 'Deleted',
    href: '/dashboard/deleted-templates',
    icon: Trash2,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
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
      className={cn(
        'fixed left-0 top-0 h-screen bg-white border-r border-gray-200',
        'transition-all duration-300 ease-in-out z-50 flex flex-col',
        isCollapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
        <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center w-full')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4648d4] to-[#6063ee] flex items-center justify-center text-white font-black text-base shadow-md shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none">
                devCache
              </h1>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500 mt-0.5">
                Engineering Hub
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-[#4648d4] hover:border-[#4648d4] hover:shadow-md transition-all"
      >
        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Quick Create Actions - Top */}
      <div className="px-3 pt-4 pb-3 border-b border-gray-100 shrink-0">
        {!isCollapsed ? (
          <div className="flex gap-2">
            <button
              onClick={() => openCreateModal('folder')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:border-[#4648d4] hover:text-[#4648d4] hover:bg-blue-50 transition-all shadow-sm"
              title="New Folder"
            >
              <Folder className="h-4 w-4" />
              <span className="text-xs font-semibold">Folder</span>
            </button>
            <button
              onClick={() => openCreateModal('file')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:border-[#4648d4] hover:text-[#4648d4] hover:bg-blue-50 transition-all shadow-sm"
              title="New File"
            >
              <FileText className="h-4 w-4" />
              <span className="text-xs font-semibold">File</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => openCreateModal('folder')}
              className="w-full flex items-center justify-center p-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:border-[#4648d4] hover:text-[#4648d4] hover:bg-blue-50 transition-all shadow-sm"
              title="New Folder"
            >
              <Folder className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => openCreateModal('file')}
              className="w-full flex items-center justify-center p-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:border-[#4648d4] hover:text-[#4648d4] hover:bg-blue-50 transition-all shadow-sm"
              title="New File"
            >
              <FileText className="h-4.5 w-4.5" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto min-h-0">
        {/* Main Navigation */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
              Main
            </p>
          )}
          {mainMenuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group',
                  isCollapsed && 'justify-center',
                  isActive
                    ? 'bg-[#4648d4] text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-white' : item.color)} />
                {!isCollapsed && (
                  <span className="text-sm font-semibold">
                    {item.title}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Workspace Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
              Workspace
            </p>
          )}
          {workspaceItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                  isCollapsed && 'justify-center',
                  isActive
                    ? 'bg-gray-100 text-gray-900 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className={cn('h-4.5 w-4.5 shrink-0', isActive ? item.color : '')} />
                {!isCollapsed && (
                  <span className="text-sm font-medium">
                    {item.title}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Projects Tree */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
              Projects
            </p>
          )}
          {!isCollapsed ? (
            <SidebarProjectsTree isCollapsed={isCollapsed} />
          ) : (
            <Link
              href="/dashboard/projects"
              className={cn(
                'flex items-center justify-center px-3 py-2.5 rounded-lg transition-all',
                pathname?.startsWith('/dashboard/projects')
                  ? 'bg-gray-100 text-[#4648d4] font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
              title="Projects"
            >
              <FolderKanban className="h-4.5 w-4.5 shrink-0" />
            </Link>
          )}
        </div>
      </nav>

      {/* Bottom Section - Settings & Trash */}
      <div className="px-3 py-3 border-t border-gray-100 shrink-0 space-y-1">
        {bottomMenuItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                isCollapsed && 'justify-center',
                isActive
                  ? item.title === 'Deleted' 
                    ? 'bg-red-50 text-red-600 font-semibold'
                    : 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <Icon className={cn('h-4.5 w-4.5 shrink-0', isActive ? item.color : '')} />
              {!isCollapsed && (
                <span className="text-sm font-medium">
                  {item.title}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
