'use client'

import { SidebarProvider, DashboardSidebar, useSidebarContext } from '@/components/dashboard-sidebar'

function DashboardContent({
  children,
  displayName,
  jobTitle,
}: {
  children: React.ReactNode
  displayName: string
  jobTitle: string
}) {
  const { isCollapsed } = useSidebarContext()

  return (
    <>
      <DashboardSidebar />
      
      {/* Main Content Area - with dynamic left margin based on sidebar state */}
      <div 
        className={`transition-all duration-300 ${isCollapsed ? 'ml-[72px]' : 'ml-64'}`}
      >
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 bg-[#f7f9fb] border-b border-[#c7c4d7]/10">
          <div className="flex items-center gap-4 px-6 py-4">
            {/* Search */}
            <div className="flex items-center flex-1 max-w-xl">
              <div className="relative w-full group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#464554] group-focus-within:text-[#4648d4] transition-colors text-xl">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Quick search projects, templates, or snippets..."
                  className="w-full pl-12 pr-4 py-2.5 bg-white border border-[#c7c4d7]/20 rounded-xl focus:ring-2 focus:ring-[#4648d4]/20 focus:border-[#4648d4] outline-none text-sm transition-all"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="ml-auto flex items-center gap-4">
              <button className="p-2 text-[#464554] hover:bg-[#f2f4f6] rounded-full transition-colors">
                <span className="material-symbols-outlined">help</span>
              </button>

              <div className="w-px h-6 bg-[#c7c4d7]/30" />

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-[#191c1e] leading-none">{displayName}</p>
                  <p className="text-[10px] text-[#464554] font-medium tracking-wide">{jobTitle}</p>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-[#4648d4]/10 bg-gradient-to-br from-[#4648d4] to-[#6063ee] flex items-center justify-center text-white font-bold text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-10">
          {children}
        </main>
      </div>
    </>
  )
}

export function DashboardLayoutClient({
  children,
  displayName,
  jobTitle,
}: {
  children: React.ReactNode
  displayName: string
  jobTitle: string
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#f7f9fb]">
        <DashboardContent displayName={displayName} jobTitle={jobTitle}>
          {children}
        </DashboardContent>
      </div>
    </SidebarProvider>
  )
}
