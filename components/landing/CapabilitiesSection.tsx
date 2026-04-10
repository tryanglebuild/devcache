import { GitMerge, Store, Database, Gauge, Star } from 'lucide-react'

const agents = [
  { icon: Database, name: 'Supabase Expert Agent', rating: '4.9', downloads: '5.2K' },
  { icon: Gauge, name: 'Next.js Performance', rating: '4.8', downloads: '3.8K' },
  { icon: GitMerge, name: 'Full-Stack Orchestrator', rating: '4.8', downloads: '4.3K' },
]

export default function CapabilitiesSection() {
  return (
    <section className="py-20 bg-slate-50/70 dark:bg-surface-container border-y border-slate-100 dark:border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-on-surface mb-4 tracking-tight">
              Agents that go deep, not broad.
            </h2>
            <p className="text-slate-500 dark:text-on-surface-variant text-base mb-10 leading-relaxed">
              Each agent is a domain expert with your standards built in. They don&apos;t just answer questions — they guide implementations with context-aware precision.
            </p>
            <div className="space-y-7">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white dark:bg-surface flex items-center justify-center border border-slate-200 dark:border-white/[0.06] mt-0.5">
                  <GitMerge size={16} strokeWidth={1.5} className="text-slate-500 dark:text-gray-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-on-surface text-sm mb-1">Stack agents for bigger problems</h4>
                  <p className="text-slate-500 dark:text-on-surface-variant text-sm leading-relaxed">
                    Run a design agent, a QA agent, and a backend agent on the same task. Each brings its own expertise. You get the combined output.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white dark:bg-surface flex items-center justify-center border border-slate-200 dark:border-white/[0.06] mt-0.5">
                  <Store size={16} strokeWidth={1.5} className="text-slate-500 dark:text-gray-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-on-surface text-sm mb-1">Don&apos;t start from scratch</h4>
                  <p className="text-slate-500 dark:text-on-surface-variant text-sm leading-relaxed">
                    Browse agents built by developers who&apos;ve already solved your problem. Fork them, adapt them, or publish your own improvements.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -top-8 -left-8 w-40 h-40 bg-indigo-200 dark:bg-[#7c7ff5]/20 rounded-full blur-[72px] opacity-40 pointer-events-none" />
            <div className="bg-white dark:bg-surface rounded-2xl border border-slate-200 dark:border-white/[0.07] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-white/[0.06]">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-surface-container-highest" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-surface-container-highest" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-surface-container-highest" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-on-surface-variant uppercase tracking-widest">
                  Agent Marketplace
                </span>
                <div className="w-16" />
              </div>
              <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {agents.map(({ icon: Icon, name, rating, downloads }) => (
                  <div key={name} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-surface-container transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-surface-container flex items-center justify-center shrink-0">
                      <Icon size={16} strokeWidth={1.5} className="text-slate-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-900 dark:text-on-surface font-semibold text-sm">{name}</div>
                      <div className="text-slate-400 dark:text-on-surface-variant text-xs mt-0.5 flex items-center gap-1.5">
                        <Star size={10} strokeWidth={2} className="text-amber-400 fill-amber-400" />
                        {rating} · {downloads} downloads
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
