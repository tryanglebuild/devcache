import Link from 'next/link'
import type { AgentTemplateWithStats, MarketplaceStats } from '@/types/agents.types'

interface MarketplaceSectionProps {
  agents?: AgentTemplateWithStats[]
  stats?: MarketplaceStats | null
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  design:   { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', icon: 'palette' },
  product:  { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', icon: 'lightbulb' },
  qa:       { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', icon: 'bug_report' },
  security: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', icon: 'security' },
  data:     { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', icon: 'database' },
  devops:   { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', icon: 'deployed_code' },
  backend:  { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', icon: 'smart_toy' },
  frontend: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', icon: 'smart_toy' },
  default:  { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', icon: 'smart_toy' },
}

function formatDownloads(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

export default function MarketplaceSection({ agents = [], stats }: MarketplaceSectionProps) {
  const totalAgents = stats?.total_agents ?? 0
  const totalDownloads = stats?.total_downloads ?? 0

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <span className="text-indigo-600 font-extrabold tracking-[0.2em] text-[10px] uppercase mb-4 block">
            Community Marketplace
          </span>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-6">
            Discover Expert AI Agents
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Access specialized agents across design, development, product, QA, and more. Created by experts, rated by the community.
          </p>
        </div>

        {agents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {agents.slice(0, 6).map((agent) => {
                const cat = CATEGORY_COLORS[agent.category?.toLowerCase() || ''] || CATEGORY_COLORS.default
                const tags = (agent.tags || []).slice(0, 3)
                return (
                  <div key={agent.id} className="bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:shadow-xl transition-all group">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-14 h-14 rounded-2xl ${cat.bg} flex items-center justify-center`}>
                        <span className={`material-symbols-outlined ${cat.text} text-3xl`}>{cat.icon}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                        <span className="material-symbols-outlined text-gray-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="text-sm font-bold text-slate-900">{(agent.rating_average || 0).toFixed(1)}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-1">{agent.name}</h3>
                    <p className="text-slate-600 text-sm mb-6 leading-relaxed line-clamp-3">
                      {agent.description || 'No description available.'}
                    </p>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {tags.map((tag) => (
                          <span key={tag} className={`text-[10px] font-bold bg-white px-3 py-1.5 rounded-full ${cat.text} border ${cat.border} uppercase`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <span className="material-symbols-outlined text-lg">download</span>
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
                className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:translate-y-[-2px] transition-all inline-block"
              >
                Browse All Agents
              </Link>
              {(totalAgents > 0 || totalDownloads > 0) && (
                <p className="mt-6 text-slate-500 text-sm">
                  {totalAgents > 0 && `${totalAgents}+ agents available`}
                  {totalAgents > 0 && totalDownloads > 0 && ' • '}
                  {totalDownloads > 0 && `${formatDownloads(totalDownloads)} downloads`}
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-gray-400 text-3xl">smart_toy</span>
            </div>
            <p className="text-slate-500 mb-6">No agents available yet. Be the first to create one!</p>
            <Link
              href="/signup"
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:translate-y-[-2px] transition-all inline-block"
            >
              Start Building Agents
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
