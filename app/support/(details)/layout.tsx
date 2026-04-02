import { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function SupportDetailsLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let displayName = 'User'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    
    displayName = profile?.full_name || user.email?.split('@')[0] || 'User'
  }

  return (
    <div className="min-h-screen">
      {/* Navigation - Same as main support page */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                layers
              </span>
            </div>
            <div className="text-xl font-bold tracking-tighter text-slate-900">devCache</div>
          </Link>
          
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <Link href="/dashboard" className="text-slate-600 text-sm font-semibold hover:text-slate-900 transition-all px-4 py-2">
                  Dashboard
                </Link>
                <Link href="/marketplace" className="text-slate-600 text-sm font-semibold hover:text-slate-900 transition-all px-4 py-2">
                  Marketplace
                </Link>
                <Link href="/support" className="text-slate-600 text-sm font-semibold hover:text-slate-900 transition-all px-4 py-2">
                  Support
                </Link>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-bold text-xs">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{displayName}</span>
                </div>
              </>
            ) : (
              <>
                <Link href="/support" className="text-slate-600 text-sm font-semibold hover:text-slate-900 transition-all px-4 py-2">
                  Support
                </Link>
                <Link href="/login" className="text-slate-600 text-sm font-semibold hover:text-slate-900 transition-all px-4 py-2">
                  Sign In
                </Link>
                <Link 
                  href="/signup"
                  className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-16">
        {children}
      </div>
    </div>
  )
}

