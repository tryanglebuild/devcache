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
  Settings,
  Star,
  HelpCircle,
  MessageSquare,
} from 'lucide-react'
import { useCreateItem } from '@/components/providers/CreateItemProvider'
import { SidebarProjectsTree } from '@/components/dashboard/SidebarProjectsTree'
import { cn } from '@/lib/utils'
import { DevCacheLogo } from '@/components/ui/DevCacheLogo'
import { useTheme } from '@/components/providers/ThemeProvider'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const mainMenuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    color: 'text-gray-500 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-surface-container',
  },
  {
    title: 'Marketplace',
    href: '/marketplace',
    icon: Store,
    color: 'text-gray-500 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-surface-container',
  },
  {
    title: 'Chat',
    href: '/chat',
    icon: MessageSquare,
    color: 'text-gray-500 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-surface-container',
  },
]

const workspaceItems = [
  {
    title: 'My Templates',
    href: '/dashboard/my-templates',
    icon: FileCode,
    color: 'text-gray-500 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-surface-container',
  },
  {
    title: 'Favorites',
    href: '/dashboard/favorites',
    icon: Star,
    color: 'text-gray-500 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-surface-container',
  },
  {
    title: 'Tags',
    href: '/dashboard/tags',
    icon: Tag,
    color: 'text-gray-500 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-surface-container',
  },
]

const bottomMenuItems = [
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    color: 'text-gray-500 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-surface-container',
  },
  {
    title: 'Support',
    href: '/support',
    icon: HelpCircle,
    color: 'text-gray-500 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-surface-container',
  },
  {
    title: 'Deleted',
    href: '/dashboard/deleted-templates',
    icon: Trash2,
    color: 'text-gray-500 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-surface-container',
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
  const { resolvedTheme } = useTheme()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white dark:bg-surface border-r border-gray-200 dark:border-white/[0.09]',
        'transition-all duration-300 ease-in-out z-50 flex flex-col',
        isCollapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-white/[0.06] shrink-0">
        <div className={cn('flex items-center gap-3 min-w-0', isCollapsed && 'justify-center w-full')}>
          {isCollapsed ? (
            <DevCacheLogo iconOnly size="sm" theme={resolvedTheme} />
          ) : (
            <div className="flex flex-col min-w-0">
              <DevCacheLogo size="sm" theme={resolvedTheme} />
              <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-1 pl-[42px]">
                AI Agent Marketplace
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-surface-container border border-gray-200 dark:border-white/[0.09] rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-[#4f46e5] dark:hover:text-[#7c7ff5] hover:border-[#4f46e5] dark:hover:border-[#7c7ff5] hover:shadow-md transition-all"
      >
        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Quick Create Actions - Top */}
      <div className="px-3 pt-4 pb-3 border-b border-gray-100 dark:border-white/[0.06] shrink-0">
        {!isCollapsed ? (
          <div className="flex gap-2">
            <button
              onClick={() => openCreateModal('folder')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white dark:bg-surface-container border border-gray-200 dark:border-white/[0.09] text-gray-700 dark:text-gray-300 hover:border-[#4f46e5] dark:hover:border-[#7c7ff5] hover:text-[#4f46e5] dark:hover:text-[#7c7ff5] hover:bg-blue-50 dark:hover:bg-[#7c7ff5]/10 transition-all shadow-sm"
              title="New Folder"
            >
              <Folder className="h-4 w-4 shrink-0" />
              <span className="text-xs font-semibold">Folder</span>
            </button>
            <button
              onClick={() => openCreateModal('file')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white dark:bg-surface-container border border-gray-200 dark:border-white/[0.09] text-gray-700 dark:text-gray-300 hover:border-[#4f46e5] dark:hover:border-[#7c7ff5] hover:text-[#4f46e5] dark:hover:text-[#7c7ff5] hover:bg-blue-50 dark:hover:bg-[#7c7ff5]/10 transition-all shadow-sm"
              title="New File"
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span className="text-xs font-semibold">File</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => openCreateModal('folder')}
              className="w-full flex items-center justify-center p-2.5 rounded-lg bg-white dark:bg-surface-container border border-gray-200 dark:border-white/[0.09] text-gray-700 dark:text-gray-300 hover:border-[#4f46e5] dark:hover:border-[#7c7ff5] hover:text-[#4f46e5] dark:hover:text-[#7c7ff5] hover:bg-blue-50 dark:hover:bg-[#7c7ff5]/10 transition-all shadow-sm"
              title="New Folder"
            >
              <Folder className="h-4 w-4 shrink-0" />
            </button>
            <button
              onClick={() => openCreateModal('file')}
              className="w-full flex items-center justify-center p-2.5 rounded-lg bg-white dark:bg-surface-container border border-gray-200 dark:border-white/[0.09] text-gray-700 dark:text-gray-300 hover:border-[#4f46e5] dark:hover:border-[#7c7ff5] hover:text-[#4f46e5] dark:hover:text-[#7c7ff5] hover:bg-blue-50 dark:hover:bg-[#7c7ff5]/10 transition-all shadow-sm"
              title="New File"
            >
              <FileText className="h-4 w-4 shrink-0" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto min-h-0 flex flex-col">
        {/* Main Navigation */}
        <div className="space-y-1 shrink-0">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
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
                    ? 'bg-[#4f46e5] text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-container-high'
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
        <div className="space-y-1 shrink-0">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
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
                    ? 'bg-gray-100 dark:bg-surface-container-high text-gray-900 dark:text-on-surface font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-container hover:text-gray-900 dark:hover:text-on-surface'
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className={cn('h-5 w-5 shrink-0', isActive ? item.color : '')} />
                {!isCollapsed && (
                  <span className="text-sm font-medium">
                    {item.title}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Projects Tree - Takes remaining space */}
        <div className="flex-1 flex flex-col min-h-0">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 shrink-0">
              Projects
            </p>
          )}
          {!isCollapsed ? (
            <div className="flex-1 min-h-0">
              <SidebarProjectsTree isCollapsed={isCollapsed} />
            </div>
          ) : (
            <Link
              href="/dashboard/projects"
              className={cn(
                'flex items-center justify-center px-3 py-2.5 rounded-lg transition-all',
                pathname?.startsWith('/dashboard/projects')
                  ? 'bg-gray-100 dark:bg-surface-container-high text-[#4f46e5] dark:text-[#7c7ff5] font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-container hover:text-gray-900 dark:hover:text-on-surface'
              )}
              title="Projects"
            >
              <FolderKanban className="h-5 w-5 shrink-0" />
            </Link>
          )}
        </div>
      </nav>

      {/* Bottom Section - Settings & Trash */}
      <div className="px-3 pb-3 shrink-0 space-y-1">
        {/* Divider row with theme toggle sitting on the line */}
        <div className={cn(
          'flex items-center mb-1',
          isCollapsed ? 'justify-center pt-3 border-t border-gray-100 dark:border-white/[0.06]' : 'justify-end'
        )}>
          {!isCollapsed && (
            <div className="flex-1 h-px bg-gray-100 dark:bg-white/[0.06] mr-2" />
          )}
          <ThemeToggle simple />
        </div>

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
                  ? 'bg-gray-100 dark:bg-surface-container-high text-gray-900 dark:text-on-surface font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-container hover:text-gray-900 dark:hover:text-on-surface'
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <Icon className={cn('h-5 w-5 shrink-0', isActive ? item.color : '')} />
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
