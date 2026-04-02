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
import { User, LogOut, Settings } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

function ChatContent({
  children,
  displayName,
  jobTitle,
  email,
  createdAt,
}: {
  children: React.ReactNode
  displayName: string
  jobTitle: string
  email: string
  createdAt?: string
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
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      })
      
      if (response.ok) {
        toast.success('Logged out successfully')
        if (isMounted) {
          router.push('/login')
        }
      } else {
        toast.error('Failed to logout')
      }
    } catch (error) {
      toast.error('An error occurred during logout')
    }
  }

  return (
    <>
      <DashboardSidebar />
      
      {/* Profile Modal */}
      <ProfileModal
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        displayName={displayName}
        email={email}
        jobTitle={jobTitle}
        createdAt={createdAt}
      />
      
      {/* Main Content Area - with dynamic left margin based on sidebar state */}
      <div 
        className={`transition-all duration-300 ${isCollapsed ? 'ml-[72px]' : 'ml-64'}`}
      >
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#e8eff3]">
          <div className="flex items-center justify-between gap-4 px-6 py-2.5">
            {/* Left spacer for balance */}
            <div className="w-[200px]" />
            
            {/* Search - Centered */}
            <div className="flex-1 flex justify-center max-w-2xl mx-auto">
              <SearchBar />
            </div>

            {/* Right Side */}
            <div className="ml-auto flex items-center gap-3">
              <Link href="/support" className="p-1.5 text-[#464554] hover:bg-[#f2f4f6] rounded-lg transition-colors" title="Help & Support">
                <span className="material-symbols-outlined text-[20px]">help</span>
              </Link>

              <div className="w-px h-5 bg-[#c7c4d7]/20" />

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-[#191c1e] leading-none">{displayName}</p>
                      <p className="text-[9px] text-[#464554] font-medium tracking-wide">{jobTitle}</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg border border-[#4f46e5]/10 bg-gradient-to-br from-[#4f46e5] to-[#6366f1] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border border-[#c7c4d7]/20">
                  <DropdownMenuLabel className="font-bold text-[#191c1e]">
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#c7c4d7]/20" />
                  <DropdownMenuItem 
                    onClick={() => setIsProfileModalOpen(true)}
                    className="cursor-pointer hover:bg-[#f7f9fb] focus:bg-[#f7f9fb]"
                  >
                    <User className="mr-2 h-4 w-4 text-[#4648d4]" />
                    <span className="font-medium">Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => router.push('/dashboard/settings')}
                    className="cursor-pointer hover:bg-[#f7f9fb] focus:bg-[#f7f9fb]"
                  >
                    <Settings className="mr-2 h-4 w-4 text-[#464554]" />
                    <span className="font-medium">Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#c7c4d7]/20" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="cursor-pointer hover:bg-[#f7f9fb] focus:bg-[#f7f9fb] text-[#ba1a1a]"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content - Full height without padding for chat */}
        <main className="h-[calc(100vh-57px)]">
          {children}
        </main>
      </div>
    </>
  )
}

export function ChatLayoutClient({
  children,
  displayName,
  jobTitle,
  email,
  createdAt,
}: {
  children: React.ReactNode
  displayName: string
  jobTitle: string
  email: string
  createdAt?: string
}) {
  return (
    <SidebarProvider>
      <CreateItemProvider>
        <div className="min-h-screen bg-[#f7f9fb]">
          <ChatContent 
            displayName={displayName} 
            jobTitle={jobTitle}
            email={email}
            createdAt={createdAt}
          >
            {children}
          </ChatContent>
        </div>
      </CreateItemProvider>
    </SidebarProvider>
  )
}
