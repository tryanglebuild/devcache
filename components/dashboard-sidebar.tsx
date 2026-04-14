'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createContext, useContext, useState, useRef, ReactNode } from 'react'
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
  Plus,
  Settings,
  Star,
  HelpCircle,
  MessageSquare,
  RotateCw,
} from 'lucide-react'
import { SidebarProjectsTree, SidebarProjectsTreeHandle } from '@/components/dashboard/SidebarProjectsTree'
import { cn } from '@/lib/utils'
import { DevCacheLogo } from '@/components/ui/DevCacheLogo'
import { useTheme } from '@/components/providers/ThemeProvider'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const mainMenuItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Marketplace', href: '/marketplace', icon: Store },
  { title: 'Chat', href: '/chat', icon: MessageSquare },
]

const workspaceItems = [
  { title: 'Favorites', href: '/dashboard/favorites', icon: Star },
  { title: 'Tags', href: '/dashboard/tags', icon: Tag },
]

const bottomMenuItems = [
  { title: 'Settings', href: '/dashboard/settings', icon: Settings },
  { title: 'Support', href: '/support', icon: HelpCircle },
  { title: 'Deleted', href: '/dashboard/deleted-templates', icon: Trash2 },
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
  const [quickCreateType, setQuickCreateType] = useState<'folder' | 'file' | null>(null)
  const treeRef = useRef<SidebarProjectsTreeHandle>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { resolvedTheme } = useTheme()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    treeRef.current?.refresh()
    setTimeout(() => setIsRefreshing(false), 600)
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white dark:bg-surface border-r border-gray-200 dark:border-white/[0.09]',
        'transition-all duration-300 ease-in-out z-50 flex flex-col',
        isCollapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-white/[0.06] shrink-0">
        <div className={cn('flex items-center gap-3 min-w-0', isCollapsed && 'justify-center w-full')}>
          {isCollapsed ? (
            <DevCacheLogo iconOnly size="sm" theme={resolvedTheme} />
          ) : (
            <div className="flex flex-col min-w-0">
              <DevCacheLogo size="sm" theme={resolvedTheme} />
              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-1 pl-[42px]">
                AI Agent Marketplace
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-surface-container border border-slate-200 dark:border-white/[0.09] rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-[#7c7ff5] hover:border-indigo-500 dark:hover:border-[#7c7ff5] hover:shadow-md transition-all"
      >
        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto min-h-0 flex flex-col">
        {/* Main Navigation */}
        <div className="space-y-1 shrink-0">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
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
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-container-high'
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500')} />
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
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
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
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-[#7c7ff5] font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-surface-container hover:text-slate-900 dark:hover:text-on-surface'
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-indigo-600 dark:text-[#7c7ff5]' : 'text-slate-400 dark:text-slate-500')} />
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
            <div className="flex items-center mb-2 shrink-0 px-3">
              <Link href="/dashboard/projects" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-[#7c7ff5] transition-colors flex-1">
                Projects
              </Link>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleRefresh}
                  title="Refresh"
                  className="w-5 h-5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-[#7c7ff5] transition-colors flex items-center justify-center"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setQuickCreateType('folder')}
                  title="New Folder"
                  className="relative w-5 h-5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-[#7c7ff5] transition-colors"
                >
                  <Folder className="w-4 h-4" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-white dark:bg-surface rounded-full flex items-center justify-center">
                    <Plus className="w-1.5 h-1.5" strokeWidth={3} />
                  </span>
                </button>
                <button
                  onClick={() => setQuickCreateType('file')}
                  title="New File"
                  className="relative w-5 h-5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-[#7c7ff5] transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-white dark:bg-surface rounded-full flex items-center justify-center">
                    <Plus className="w-1.5 h-1.5" strokeWidth={3} />
                  </span>
                </button>
              </div>
            </div>
          )}
          {!isCollapsed ? (
            <div className="flex-1 min-h-0">
              <SidebarProjectsTree
                ref={treeRef}
                isCollapsed={isCollapsed}
                quickCreateType={quickCreateType}
                onQuickCreateDone={() => setQuickCreateType(null)}
              />
            </div>
          ) : (
            <Link
              href="/dashboard/projects"
              className={cn(
                'flex items-center justify-center px-3 py-2.5 rounded-lg transition-all',
                pathname?.startsWith('/dashboard/projects')
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-[#7c7ff5] font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-surface-container hover:text-slate-900 dark:hover:text-on-surface'
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
          isCollapsed ? 'justify-center pt-3 border-t border-slate-100 dark:border-white/[0.06]' : 'justify-end'
        )}>
          {!isCollapsed && (
            <div className="flex-1 h-px bg-slate-100 dark:bg-white/[0.06] mr-2" />
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
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-[#7c7ff5] font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-surface-container hover:text-slate-900 dark:hover:text-on-surface'
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-indigo-600 dark:text-[#7c7ff5]' : 'text-slate-400 dark:text-slate-500')} />
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
