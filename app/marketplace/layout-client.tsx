'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarProvider, DashboardSidebar, useSidebarContext } from '@/components/dashboard-sidebar'
import { CreateItemProvider } from '@/components/providers/CreateItemProvider'
import { ProfileModal } from '@/components/dashboard/ProfileModal'
import { SearchBar } from '@/components/dashboard/SearchBar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Settings, HelpCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

function MarketplaceContent({
  children,
  displayName,
  jobTitle,
  email,
  createdAt,
  isAuthenticated,
}: {
  children: React.ReactNode
  displayName: string
  jobTitle: string
  email: string
  createdAt?: string
  isAuthenticated: boolean
}) {
  const { isCollapsed } = useSidebarContext()
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleLogout = async () => {
    try {
      toast.loading('Logging out...')
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      })

      if (response.ok) {
        toast.dismiss()
        toast.success('Logged out successfully')
        router.push('/login')
        router.refresh()
      } else {
        toast.dismiss()
        const data = await response.json()
        toast.error(data.error || 'Failed to logout')
      }
    } catch (error) {
      toast.dismiss()
      console.error('Logout error:', error)
      toast.error('An error occurred during logout')
    }
  }

  return (
    <>
      <DashboardSidebar />

      {isAuthenticated && (
        <ProfileModal
          open={isProfileModalOpen}
          onOpenChange={setIsProfileModalOpen}
          displayName={displayName}
          email={email}
          jobTitle={jobTitle}
          createdAt={createdAt}
        />
      )}

      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-[72px]' : 'ml-64'}`}>
        <header className="sticky top-0 z-40 bg-[#f7f9fb] dark:bg-surface border-b border-[#c7c4d7]/10 dark:border-white/[0.06]">
          <div className="flex items-center justify-between gap-4 px-6 py-4">
            <div className="w-[200px]" />

            <div className="flex-1 flex justify-center max-w-2xl mx-auto">
              <SearchBar />
            </div>

            <div className="ml-auto flex items-center gap-4">
              <Link href="/support" className="p-2 text-[#464554] dark:text-on-surface-variant hover:bg-[#f2f4f6] dark:hover:bg-surface-container-high rounded-full transition-colors" title="Help & Support">
                <HelpCircle size={22} strokeWidth={1.5} />
              </Link>

              <div className="w-px h-6 bg-[#c7c4d7]/30 dark:bg-white/[0.09]" />

              <ThemeToggle simple />

              <div className="w-px h-6 bg-[#c7c4d7]/30 dark:bg-white/[0.09]" />

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#191c1e] dark:text-on-surface leading-none">
                          {displayName}
                        </p>
                        <p className="text-[10px] text-[#464554] dark:text-on-surface-variant font-medium tracking-wide">
                          {jobTitle}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-[#4f46e5]/10 dark:border-[#7c7ff5]/20 bg-gradient-to-br from-[#4f46e5] to-[#4338ca] flex items-center justify-center text-white font-bold text-sm">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-surface-container border border-[#c7c4d7]/20 dark:border-white/[0.09]">
                    <DropdownMenuLabel className="font-bold text-[#191c1e] dark:text-on-surface">
                      My Account
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-[#c7c4d7]/20 dark:bg-white/[0.06]" />
                    <DropdownMenuItem
                      onClick={() => setIsProfileModalOpen(true)}
                      className="cursor-pointer hover:bg-[#f7f9fb] dark:hover:bg-surface-container-high focus:bg-[#f7f9fb] dark:focus:bg-surface-container-high"
                    >
                      <User className="mr-2 h-4 w-4 text-[#4f46e5] dark:text-[#7c7ff5]" />
                      <span className="font-medium">Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push('/dashboard/settings')}
                      className="cursor-pointer hover:bg-[#f7f9fb] dark:hover:bg-surface-container-high focus:bg-[#f7f9fb] dark:focus:bg-surface-container-high"
                    >
                      <Settings className="mr-2 h-4 w-4 text-[#464554] dark:text-on-surface-variant" />
                      <span className="font-medium">Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#c7c4d7]/20 dark:bg-white/[0.06]" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer hover:bg-[#f7f9fb] dark:hover:bg-surface-container-high focus:bg-[#f7f9fb] dark:focus:bg-surface-container-high text-[#ba1a1a] dark:text-red-400"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span className="font-medium">Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push('/login')}
                    className="px-4 py-2 text-[#464554] dark:text-on-surface-variant hover:text-[#191c1e] dark:hover:text-on-surface font-semibold text-sm transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => router.push('/signup')}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#4f46e5] to-[#4338ca] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#4f46e5]/20 dark:shadow-[#7c7ff5]/10 hover:shadow-xl transition-all"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-10">
          {children}
        </main>
      </div>
    </>
  )
}

export function MarketplaceLayoutClient({
  children,
  displayName,
  jobTitle,
  email,
  createdAt,
  isAuthenticated,
}: {
  children: React.ReactNode
  displayName: string
  jobTitle: string
  email: string
  createdAt?: string
  isAuthenticated: boolean
}) {
  return (
    <SidebarProvider>
      <CreateItemProvider>
        <div className="min-h-screen bg-[#f7f9fb] dark:bg-surface">
          <MarketplaceContent
            displayName={displayName}
            jobTitle={jobTitle}
            email={email}
            createdAt={createdAt}
            isAuthenticated={isAuthenticated}
          >
            {children}
          </MarketplaceContent>
        </div>
      </CreateItemProvider>
    </SidebarProvider>
  )
}
