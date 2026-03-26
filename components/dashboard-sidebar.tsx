'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  FolderKanban,
  BookOpen,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Projects',
    href: '/dashboard/projects',
    icon: FolderKanban,
  },
  {
    title: 'Library',
    href: '/dashboard/library',
    icon: BookOpen,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

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
      <nav className="flex-1 px-3 py-6 space-y-1">
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
      </nav>

      {/* New Entry Button */}
      <div className="px-3 py-4">
        <button
          className={`
            w-full py-2.5 bg-gradient-to-br from-[#4648d4] to-[#6063ee] text-white rounded-lg font-bold text-sm
            flex items-center gap-2 shadow-lg shadow-[#4648d4]/20 hover:shadow-xl transition-all
            ${isCollapsed ? 'justify-center px-2' : 'justify-center px-3'}
          `}
          title={isCollapsed ? 'New Entry' : undefined}
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>New Entry</span>}
        </button>
      </div>

      {/* Footer */}
      <div className="border-t border-[#c7c4d7]/20 px-3 py-3 space-y-1">
        <Link
          href="/support"
          className={`
            flex items-center gap-3 px-3 py-2.5 text-[#464554] hover:bg-[#e0e3e5] rounded-lg transition-all
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title={isCollapsed ? 'Support' : undefined}
        >
          <HelpCircle className="h-5 w-5 shrink-0" />
          {!isCollapsed && (
            <span className="text-sm font-medium uppercase tracking-wider">Support</span>
          )}
        </Link>
        <Link
          href="/api/auth/signout"
          className={`
            flex items-center gap-3 px-3 py-2.5 text-[#464554] hover:bg-[#e0e3e5] rounded-lg transition-all
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0 text-[#ba1a1a]" />
          {!isCollapsed && (
            <span className="text-sm font-medium uppercase tracking-wider">Logout</span>
          )}
        </Link>
      </div>
    </aside>
  )
}
