'use client'

import Link from 'next/link'
import { GitFork } from 'lucide-react'
import { DevCacheLogo } from '@/components/ui/DevCacheLogo'
import { useTheme } from '@/components/providers/ThemeProvider'

export default function Footer() {
  const { resolvedTheme } = useTheme()

  return (
    <footer className="bg-slate-50 dark:bg-surface pt-24 pb-12 border-t border-slate-200 dark:border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-16">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-8">
            <DevCacheLogo size="xs" theme={resolvedTheme} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
            DevCache is where developer expertise becomes reusable AI agents — built by practitioners, shared with the community, run on any project.
          </p>
          <div className="flex gap-5">
            <GitFork size={20} strokeWidth={1.5} className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-[#7c7ff5] cursor-pointer transition-colors" />
          </div>
        </div>
        
        <div>
          <h4 className="font-extrabold text-slate-900 dark:text-on-surface mb-8 text-[11px] uppercase tracking-[0.2em]">Platform</h4>
          <ul className="space-y-4">
            <li><Link href="#" className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-indigo-600 dark:hover:text-[#7c7ff5] transition-colors">Agents</Link></li>
            <li><Link href="#" className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-indigo-600 dark:hover:text-[#7c7ff5] transition-colors">Marketplace</Link></li>
            <li><Link href="#" className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-indigo-600 dark:hover:text-[#7c7ff5] transition-colors">Orchestration</Link></li>
            <li><Link href="#" className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-indigo-600 dark:hover:text-[#7c7ff5] transition-colors">Changelog</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-extrabold text-slate-900 dark:text-on-surface mb-8 text-[11px] uppercase tracking-[0.2em]">Resources</h4>
          <ul className="space-y-4">
            <li><Link href="#" className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-indigo-600 dark:hover:text-[#7c7ff5] transition-colors">Documentation</Link></li>
            <li><Link href="#" className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-indigo-600 dark:hover:text-[#7c7ff5] transition-colors">Status</Link></li>
            <li><Link href="#" className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-indigo-600 dark:hover:text-[#7c7ff5] transition-colors">Security</Link></li>
            <li><Link href="#" className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-indigo-600 dark:hover:text-[#7c7ff5] transition-colors">Contact</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-extrabold text-slate-900 dark:text-on-surface mb-8 text-[11px] uppercase tracking-[0.2em]">Legal</h4>
          <ul className="space-y-4">
            <li><Link href="#" className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-indigo-600 dark:hover:text-[#7c7ff5] transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-indigo-600 dark:hover:text-[#7c7ff5] transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-8 mt-24 pt-12 border-t border-slate-200 dark:border-white/[0.06] text-center">
        <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold tracking-wide">
          © {new Date().getFullYear()} devCache. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
