import Link from 'next/link'
import { Layers, Star, ArrowDownToLine, ArrowRight } from 'lucide-react'
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
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden bg-background">
      <div className="grid-bg absolute inset-0 opacity-30 -z-10" />
      
      <div className="max-w-6xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-50 dark:bg-[#7c7ff5]/10 text-indigo-600 dark:text-[#7c7ff5] text-[11px] font-bold tracking-widest uppercase mb-8 border border-indigo-100/80 dark:border-[#7c7ff5]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-[#7c7ff5]" />
          Agentic AI Marketplace
        </div>
        
        <h1 className="text-5xl md:text-[4.5rem] font-black text-slate-900 dark:text-on-surface tracking-tight leading-[1.05] mb-6 max-w-4xl mx-auto text-balance">
          Your expertise shouldn&apos;t live in your head.
        </h1>
        
        <p className="max-w-xl mx-auto text-base md:text-lg text-slate-500 dark:text-on-surface-variant leading-relaxed mb-10">
          DevCache turns your best work into AI agents — specialized, shareable, and ready to use across every project your team touches.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link 
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-semibold text-sm transition-colors"
          >
            Start building free
            <ArrowRight size={15} strokeWidth={2.5} />
          </Link>
          <Link href="/marketplace" className="w-full sm:w-auto bg-white dark:bg-surface-container border border-slate-200 dark:border-white/[0.09] text-slate-700 dark:text-on-surface px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-slate-50 dark:hover:bg-surface-container-high transition-colors">
            Explore Marketplace
          </Link>
        </div>
        
        <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400 dark:text-on-surface-variant/70">
          {totalAgents > 0 ? (
            <>
              <div className="flex items-center gap-1.5">
                <Layers size={13} strokeWidth={2} />
                <span>{formatCount(totalAgents)} agents</span>
              </div>
              <span className="text-slate-200 dark:text-white/10">·</span>
              <div className="flex items-center gap-1.5">
                <Star size={13} strokeWidth={2} className="fill-current" />
                <span>{avgRating} avg rating</span>
              </div>
              <span className="text-slate-200 dark:text-white/10">·</span>
              <div className="flex items-center gap-1.5">
                <ArrowDownToLine size={13} strokeWidth={2} />
                <span>{formatCount(totalDownloads)} downloads</span>
              </div>
            </>
          ) : (
            <>
              <span>Agents for every stack</span>
              <span className="text-slate-200 dark:text-white/10">·</span>
              <span>Public or private, you decide</span>
              <span className="text-slate-200 dark:text-white/10">·</span>
              <span>Works with any AI coding tool</span>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
