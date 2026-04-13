'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { DevCacheLogo } from '@/components/ui/DevCacheLogo'
import { useTheme } from '@/components/providers/ThemeProvider'

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { resolvedTheme } = useTheme()

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#0d1121]/85 backdrop-blur-xl border-b border-slate-100 dark:border-white/[0.06]">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-16">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <DevCacheLogo size="sm" theme={resolvedTheme} />
        </Link>
        
        <div className="hidden md:flex space-x-8 items-center">
          <Link href="#agents" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors text-sm font-medium">
            Agents
          </Link>
          <Link href="/marketplace" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors text-sm font-medium">
            Marketplace
          </Link>
          <Link href="/support" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors text-sm font-medium">
            Support
          </Link>
          <Link href="#pricing" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors text-sm font-medium">
            Pricing
          </Link>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-3">
            <Link href="/login" className="text-slate-600 dark:text-slate-400 text-sm font-semibold hover:text-slate-900 dark:hover:text-slate-200 transition-all px-4 py-2">
              Sign In
            </Link>
            <Link 
              href="/signup"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Hamburger button — mobile only */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-container transition-colors"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-surface border-b border-slate-200 dark:border-white/[0.06] px-6 pb-6 pt-2 space-y-1">
          <Link
            href="#agents"
            onClick={() => setMobileOpen(false)}
            className="block py-3 text-slate-600 dark:text-slate-400 font-medium text-sm border-b border-slate-100 dark:border-white/[0.06] hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            Agents
          </Link>
          <Link
            href="/marketplace"
            onClick={() => setMobileOpen(false)}
            className="block py-3 text-slate-600 dark:text-slate-400 font-medium text-sm border-b border-slate-100 dark:border-white/[0.06] hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            Marketplace
          </Link>
          <Link
            href="/support"
            onClick={() => setMobileOpen(false)}
            className="block py-3 text-slate-600 dark:text-slate-400 font-medium text-sm border-b border-slate-100 dark:border-white/[0.06] hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            Support
          </Link>
          <Link
            href="#pricing"
            onClick={() => setMobileOpen(false)}
            className="block py-3 text-slate-600 dark:text-slate-400 font-medium text-sm border-b border-slate-100 dark:border-white/[0.06] hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            Pricing
          </Link>
          <div className="pt-4 flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block text-center py-2.5 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:text-slate-900 dark:hover:text-slate-200 transition-colors border border-slate-200 dark:border-white/[0.09] rounded-lg"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="block text-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
