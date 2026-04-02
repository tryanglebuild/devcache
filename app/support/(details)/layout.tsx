import { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { SidebarProvider, DashboardSidebar } from '@/components/dashboard-sidebar'
import { CreateItemProvider } from '@/components/providers/CreateItemProvider'
import { SupportDetailsContent } from './SupportDetailsContent'

export default async function SupportDetailsLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is logged in, show dashboard sidebar
  if (user) {
    return (
      <SidebarProvider>
        <CreateItemProvider>
          <div className="min-h-screen bg-slate-50">
            <DashboardSidebar />
            <SupportDetailsContent>
              {children}
            </SupportDetailsContent>
          </div>
        </CreateItemProvider>
      </SidebarProvider>
    )
  }

  // For non-logged-in users, use simple layout
  return (
    <div className="min-h-screen">
      {/* Simple Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-16">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                layers
              </span>
            </div>
            <div className="text-xl font-bold tracking-tighter text-slate-900">devCache</div>
          </a>
          
          <div className="flex items-center space-x-3">
            <a href="/login" className="text-slate-600 text-sm font-semibold hover:text-slate-900 transition-all px-4 py-2">
              Sign In
            </a>
            <a 
              href="/signup"
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        {children}
      </div>
    </div>
  )
}

