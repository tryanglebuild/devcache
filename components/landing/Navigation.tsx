'use client'

import Link from 'next/link'

export default function Navigation() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-16">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              layers
            </span>
          </div>
          <div className="text-xl font-bold tracking-tighter text-slate-900">devCache</div>
        </div>
        
        <div className="hidden md:flex space-x-8 items-center">
          <Link href="#templates" className="text-indigo-600 font-semibold border-b-2 border-indigo-600 pb-1 text-sm tracking-tight">
            Templates
          </Link>
          <Link href="#knowledge" className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium tracking-tight">
            Knowledge
          </Link>
          <Link href="#workflows" className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium tracking-tight">
            Workflows
          </Link>
          <Link href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium tracking-tight">
            Pricing
          </Link>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link href="/login" className="text-slate-600 text-sm font-semibold hover:text-slate-900 transition-all px-4 py-2">
            Sign In
          </Link>
          <Link 
            href="/signup"
            className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  )
}
