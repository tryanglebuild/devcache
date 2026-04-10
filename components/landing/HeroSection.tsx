import Link from 'next/link'
import { Layers, Star, ArrowDownToLine } from 'lucide-react'
import type { MarketplaceStats } from '@/types/agents.types'

interface HeroSectionProps {
  stats?: MarketplaceStats | null
}

export default function HeroSection({ stats }: HeroSectionProps) {
  const totalAgents = stats?.total_agents ?? 0
  const avgRating = stats?.average_rating?.toFixed(1) ?? '0.0'
  const totalDownloads = stats?.total_downloads ?? 0

  const formatCount = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K+`
    return n > 0 ? `${n}+` : '0'
  }

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-background">
      <div className="grid-bg absolute inset-0 opacity-40 -z-10" />
      
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-[#7c7ff5]/10 text-indigo-700 dark:text-[#7c7ff5] text-[10px] font-extrabold tracking-[0.2em] uppercase mb-8 border border-indigo-100 dark:border-[#7c7ff5]/20">
          Agentic AI Marketplace
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-on-surface tracking-tight leading-[1.1] mb-8 max-w-4xl mx-auto text-balance">
          Your expertise shouldn&apos;t live in your head.
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-on-surface-variant leading-relaxed mb-12">
          DevCache turns your best work into AI agents — specialized, shareable, and ready to use across every project your team touches.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/signup"
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 dark:shadow-indigo-900/30 hover:translate-y-[-2px] transition-all"
          >
            Start building free
          </Link>
          <Link href="/marketplace" className="w-full sm:w-auto bg-white dark:bg-surface-container border border-slate-200 dark:border-white/[0.09] text-slate-700 dark:text-on-surface px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-surface-container-high transition-all">
            Explore Marketplace
          </Link>
        </div>
        
        {totalAgents > 0 ? (
          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-slate-500 dark:text-on-surface-variant">
            <div className="flex items-center gap-2">
              <Layers size={14} strokeWidth={2} className="text-gray-500 dark:text-gray-400" />
              <span>{formatCount(totalAgents)} Agents</span>
            </div>
            <div className="flex items-center gap-2">
              <Star size={14} strokeWidth={2} className="text-gray-500 dark:text-gray-400 fill-gray-500 dark:fill-gray-400" />
              <span>{avgRating}★ Average</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowDownToLine size={14} strokeWidth={2} className="text-gray-500 dark:text-gray-400" />
              <span>{formatCount(totalDownloads)} Downloads</span>
            </div>
          </div>
        ) : (
          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-slate-500 dark:text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span>Agents for every stack</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Public or private, you decide</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Works with any AI coding tool</span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
