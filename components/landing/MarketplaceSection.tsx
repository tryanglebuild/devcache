import Link from 'next/link'
import { Store, Star, ArrowDownToLine } from 'lucide-react'
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from '@/lib/agents/category-icons'
import type { AgentTemplateWithStats, MarketplaceStats } from '@/types/agents.types'

interface MarketplaceSectionProps {
  agents?: AgentTemplateWithStats[]
  stats?: MarketplaceStats | null
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  design:   { bg: 'bg-violet-50 dark:bg-violet-500/10',   text: 'text-violet-700 dark:text-violet-400',   border: 'border-violet-200 dark:border-violet-500/20'   },
  product:  { bg: 'bg-blue-50 dark:bg-blue-500/10',       text: 'text-blue-700 dark:text-blue-400',       border: 'border-blue-200 dark:border-blue-500/20'       },
  qa:       { bg: 'bg-amber-50 dark:bg-amber-500/10',     text: 'text-amber-700 dark:text-amber-400',     border: 'border-amber-200 dark:border-amber-500/20'     },
  security: { bg: 'bg-red-50 dark:bg-red-500/10',         text: 'text-red-700 dark:text-red-400',         border: 'border-red-200 dark:border-red-500/20'         },
  data:     { bg: 'bg-purple-50 dark:bg-purple-500/10',   text: 'text-purple-700 dark:text-purple-400',   border: 'border-purple-200 dark:border-purple-500/20'   },
  devops:   { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20' },
  backend:  { bg: 'bg-indigo-50 dark:bg-indigo-500/10',   text: 'text-indigo-700 dark:text-indigo-400',   border: 'border-indigo-200 dark:border-indigo-500/20'   },
  frontend: { bg: 'bg-sky-50 dark:bg-sky-500/10',         text: 'text-sky-700 dark:text-sky-400',         border: 'border-sky-200 dark:border-sky-500/20'         },
  default:  { bg: 'bg-slate-50 dark:bg-slate-500/10',     text: 'text-slate-600 dark:text-slate-400',     border: 'border-slate-200 dark:border-slate-500/20'     },
}


function formatDownloads(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

export default function MarketplaceSection({ agents = [], stats }: MarketplaceSectionProps) {
  const totalAgents = stats?.total_agents ?? 0
  const totalDownloads = stats?.total_downloads ?? 0

  return (
    <section className="py-24 bg-white dark:bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <span className="text-indigo-600 dark:text-[#7c7ff5] font-extrabold tracking-[0.2em] text-[10px] uppercase mb-4 block">
            Community Marketplace
          </span>
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-on-surface mb-6">
            Built by developers who&apos;ve been there.
          </h2>
          <p className="text-slate-500 dark:text-on-surface-variant text-lg max-w-2xl mx-auto">
            Every agent in the marketplace was created by someone who solved the problem for real. Browse by domain, stack, or use case — then put it to work.
          </p>
        </div>

        {agents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {agents.slice(0, 6).map((agent) => {
                const cat = CATEGORY_COLORS[agent.category?.toLowerCase() || ''] || CATEGORY_COLORS.default
                const tags = (agent.tags || []).slice(0, 3)
                const CategoryIcon = CATEGORY_ICONS[agent.category?.toLowerCase() || ''] || DEFAULT_CATEGORY_ICON
                return (
                  <div key={agent.id} className="bg-slate-50 dark:bg-surface-container rounded-3xl p-8 border border-slate-200 dark:border-white/[0.06] hover:shadow-xl dark:hover:shadow-none dark:hover:ring-1 dark:hover:ring-white/[0.12] transition-all group">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-14 h-14 rounded-2xl ${cat.bg} flex items-center justify-center`}>
                        <CategoryIcon size={28} strokeWidth={1.5} className={cat.text} />
                      </div>
                      <div className="flex items-center gap-1 bg-white dark:bg-surface px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/[0.06]">
                        <Star size={14} strokeWidth={1.5} className="text-amber-400 fill-amber-400" />
                        <span className="text-sm font-bold text-slate-900 dark:text-on-surface">{(agent.rating_average || 0).toFixed(1)}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-on-surface mb-3 line-clamp-1">{agent.name}</h3>
                    <p className="text-slate-600 dark:text-on-surface-variant text-sm mb-6 leading-relaxed line-clamp-3">
                      {agent.description || 'No description available.'}
                    </p>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {tags.map((tag) => (
                          <span key={tag} className={`text-[10px] font-bold bg-white dark:bg-surface px-3 py-1.5 rounded-full ${cat.text} border ${cat.border} uppercase dark:border-opacity-100`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-white/[0.06]">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-on-surface-variant text-sm">
                        <ArrowDownToLine size={18} strokeWidth={1.5} />
                        <span className="font-semibold">{formatDownloads(agent.download_count || 0)}</span>
                      </div>
                      <Link href="/marketplace" className={`${cat.text} font-bold text-sm hover:opacity-80 transition-opacity`}>
                        View Agent →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="text-center">
              <Link
                href="/marketplace"
                className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 dark:shadow-indigo-900/30 hover:translate-y-[-2px] transition-all inline-block"
              >
                Browse All Agents
              </Link>
              {(totalAgents > 0 || totalDownloads > 0) && (
                <p className="mt-6 text-slate-500 dark:text-on-surface-variant text-sm">
                  {totalAgents > 0 && `${totalAgents}+ agents available`}
                  {totalAgents > 0 && totalDownloads > 0 && ' • '}
                  {totalDownloads > 0 && `${formatDownloads(totalDownloads)} downloads`}
                </p>
              )}
            </div>
            {/* Trust Badges */}
            <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-slate-50 dark:bg-surface-container px-6 py-4 rounded-2xl text-center border border-slate-200 dark:border-white/[0.06]">
                <p className="font-bold text-slate-900 dark:text-on-surface text-sm">Community Rated</p>
                <p className="text-[10px] text-slate-500 dark:text-on-surface-variant uppercase tracking-widest font-extrabold mt-1">5-Star System</p>
              </div>
              <div className="bg-slate-50 dark:bg-surface-container px-6 py-4 rounded-2xl text-center border border-slate-200 dark:border-white/[0.06]">
                <p className="font-bold text-slate-900 dark:text-on-surface text-sm">Private Agents</p>
                <p className="text-[10px] text-slate-500 dark:text-on-surface-variant uppercase tracking-widest font-extrabold mt-1">Team Only</p>
              </div>
              <div className="bg-slate-50 dark:bg-surface-container px-6 py-4 rounded-2xl text-center border border-slate-200 dark:border-white/[0.06]">
                <p className="font-bold text-slate-900 dark:text-on-surface text-sm">Encrypted</p>
                <p className="text-[10px] text-slate-500 dark:text-on-surface-variant uppercase tracking-widest font-extrabold mt-1">End-to-End</p>
              </div>
              <div className="bg-slate-50 dark:bg-surface-container px-6 py-4 rounded-2xl text-center border border-slate-200 dark:border-white/[0.06]">
                <p className="font-bold text-slate-900 dark:text-on-surface text-sm">Version Control</p>
                <p className="text-[10px] text-slate-500 dark:text-on-surface-variant uppercase tracking-widest font-extrabold mt-1">Full History</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-surface-container-high flex items-center justify-center mx-auto mb-4">
              <Store size={40} strokeWidth={1} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-on-surface mb-3">The marketplace starts here.</h3>
            <p className="text-slate-500 dark:text-on-surface-variant mb-6 max-w-md mx-auto">No agents yet — but that means yours could be the first. Publish a solution you already rely on and let the community build from it.</p>
            <Link
              href="/signup"
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 dark:shadow-indigo-900/30 hover:translate-y-[-2px] transition-all inline-block"
            >
              Publish your first agent
            </Link>
            {/* Trust Badges */}
            <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-slate-50 dark:bg-surface-container px-6 py-4 rounded-2xl text-center border border-slate-200 dark:border-white/[0.06]">
                <p className="font-bold text-slate-900 dark:text-on-surface text-sm">Community Rated</p>
                <p className="text-[10px] text-slate-500 dark:text-on-surface-variant uppercase tracking-widest font-extrabold mt-1">5-Star System</p>
              </div>
              <div className="bg-slate-50 dark:bg-surface-container px-6 py-4 rounded-2xl text-center border border-slate-200 dark:border-white/[0.06]">
                <p className="font-bold text-slate-900 dark:text-on-surface text-sm">Private Agents</p>
                <p className="text-[10px] text-slate-500 dark:text-on-surface-variant uppercase tracking-widest font-extrabold mt-1">Team Only</p>
              </div>
              <div className="bg-slate-50 dark:bg-surface-container px-6 py-4 rounded-2xl text-center border border-slate-200 dark:border-white/[0.06]">
                <p className="font-bold text-slate-900 dark:text-on-surface text-sm">Encrypted</p>
                <p className="text-[10px] text-slate-500 dark:text-on-surface-variant uppercase tracking-widest font-extrabold mt-1">End-to-End</p>
              </div>
              <div className="bg-slate-50 dark:bg-surface-container px-6 py-4 rounded-2xl text-center border border-slate-200 dark:border-white/[0.06]">
                <p className="font-bold text-slate-900 dark:text-on-surface text-sm">Version Control</p>
                <p className="text-[10px] text-slate-500 dark:text-on-surface-variant uppercase tracking-widest font-extrabold mt-1">Full History</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
