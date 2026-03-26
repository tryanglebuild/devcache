import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard-sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User'
  const jobTitle = profile?.job_title || 'Developer'

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <DashboardSidebar />
      
      {/* Main Content Area - with left margin for sidebar */}
      <div className="ml-64 transition-all duration-300">
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
    </div>
  )
}
