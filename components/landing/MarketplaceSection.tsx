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
    <section className="py-20 bg-white dark:bg-surface">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-14">
          <span className="text-indigo-600 dark:text-[#7c7ff5] font-bold tracking-widest text-[10px] uppercase mb-3 block">
            Community Marketplace
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-on-surface mb-3 tracking-tight">
            Built by developers who&apos;ve been there.
          </h2>
          <p className="text-slate-500 dark:text-on-surface-variant text-base max-w-xl">
            Every agent was created by someone who solved the problem for real. Browse by domain, stack, or use case — then put it to work.
          </p>
        </div>

        {agents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
              {agents.slice(0, 6).map((agent) => {
                const cat = CATEGORY_COLORS[agent.category?.toLowerCase() || ''] || CATEGORY_COLORS.default
                const tags = (agent.tags || []).slice(0, 3)
                const CategoryIcon = CATEGORY_ICONS[agent.category?.toLowerCase() || ''] || DEFAULT_CATEGORY_ICON
                return (
                  <div key={agent.id} className="bg-slate-50 dark:bg-surface-container rounded-xl p-6 border border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12] transition-colors">
                    <div className="flex items-start justify-between mb-5">
                      <div className={`w-10 h-10 rounded-lg ${cat.bg} flex items-center justify-center`}>
                        <CategoryIcon size={20} strokeWidth={1.5} className={cat.text} />
                      </div>
                      <div className="flex items-center gap-1 bg-white dark:bg-surface px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/[0.06]">
                        <Star size={12} strokeWidth={1.5} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-slate-900 dark:text-on-surface">{(agent.rating_average || 0).toFixed(1)}</span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-on-surface mb-2 line-clamp-1">{agent.name}</h3>
                    <p className="text-slate-500 dark:text-on-surface-variant text-xs mb-4 leading-relaxed line-clamp-3">
                      {agent.description || 'No description available.'}
                    </p>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {tags.map((tag) => (
                          <span key={tag} className={`text-[10px] font-bold bg-white dark:bg-surface px-2 py-1 rounded-md ${cat.text} border ${cat.border} uppercase`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/[0.06]">
                      <div className="flex items-center gap-1.5 text-slate-400 dark:text-on-surface-variant text-xs">
                        <ArrowDownToLine size={14} strokeWidth={1.5} />
                        <span className="font-semibold">{formatDownloads(agent.download_count || 0)}</span>
                      </div>
                      <Link href="/marketplace" className={`${cat.text} font-bold text-xs hover:opacity-75 transition-opacity`}>
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
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3 rounded-xl font-semibold text-sm transition-colors"
              >
                Browse All Agents
              </Link>
              {(totalAgents > 0 || totalDownloads > 0) && (
                <p className="mt-4 text-slate-400 dark:text-on-surface-variant text-xs">
                  {totalAgents > 0 && `${totalAgents}+ agents available`}
                  {totalAgents > 0 && totalDownloads > 0 && ' · '}
                  {totalDownloads > 0 && `${formatDownloads(totalDownloads)} downloads`}
                </p>
              )}
            </div>
            {/* Trust Badges */}
            <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl mx-auto">
              {[
                { label: 'Community Rated', sub: '5-Star System' },
                { label: 'Private Agents', sub: 'Team Only' },
                { label: 'Encrypted', sub: 'End-to-End' },
                { label: 'Version Control', sub: 'Full History' },
              ].map(({ label, sub }) => (
                <div key={label} className="bg-slate-50 dark:bg-surface-container px-4 py-3 rounded-xl text-center border border-slate-200 dark:border-white/[0.06]">
                  <p className="font-bold text-slate-900 dark:text-on-surface text-xs">{label}</p>
                  <p className="text-[10px] text-slate-400 dark:text-on-surface-variant uppercase tracking-widest font-bold mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-surface-container-high flex items-center justify-center mx-auto mb-4">
              <Store size={24} strokeWidth={1.5} className="text-slate-400 dark:text-gray-500" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-on-surface mb-2">The marketplace starts here.</h3>
            <p className="text-slate-500 dark:text-on-surface-variant text-sm mb-6 max-w-sm mx-auto">No agents yet — but that means yours could be the first. Publish a solution you already rely on.</p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3 rounded-xl font-semibold text-sm transition-colors"
            >
              Publish your first agent
            </Link>
            {/* Trust Badges */}
            <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl mx-auto">
              {[
                { label: 'Community Rated', sub: '5-Star System' },
                { label: 'Private Agents', sub: 'Team Only' },
                { label: 'Encrypted', sub: 'End-to-End' },
                { label: 'Version Control', sub: 'Full History' },
              ].map(({ label, sub }) => (
                <div key={label} className="bg-slate-50 dark:bg-surface-container px-4 py-3 rounded-xl text-center border border-slate-200 dark:border-white/[0.06]">
                  <p className="font-bold text-slate-900 dark:text-on-surface text-xs">{label}</p>
                  <p className="text-[10px] text-slate-400 dark:text-on-surface-variant uppercase tracking-widest font-bold mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
