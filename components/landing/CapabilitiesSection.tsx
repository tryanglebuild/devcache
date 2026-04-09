import { GitMerge, Store, Database, Gauge, Star } from 'lucide-react'

export default function CapabilitiesSection() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-surface-container">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-on-surface mb-8 tracking-tight">
              Agents that go deep, not broad.
            </h2>
            <p className="text-slate-600 dark:text-on-surface-variant text-lg mb-12 leading-relaxed">
              Each agent is a domain expert with your standards built in. They don&apos;t just provide answers — they guide implementations with context-aware precision.
            </p>
            <div className="space-y-8">
              <div className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white dark:bg-surface shadow-sm dark:shadow-none flex items-center justify-center border border-slate-200 dark:border-white/[0.06]">
                  <GitMerge size={20} strokeWidth={1.5} className="text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-on-surface mb-1">Stack agents for bigger problems</h4>
                  <p className="text-slate-500 dark:text-on-surface-variant">
                    Run a design agent, a QA agent, and a backend agent on the same task. Each brings its own expertise. You get the combined output.
                  </p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white dark:bg-surface shadow-sm dark:shadow-none flex items-center justify-center border border-slate-200 dark:border-white/[0.06]">
                  <Store size={20} strokeWidth={1.5} className="text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-on-surface mb-1">Don&apos;t start from scratch</h4>
                  <p className="text-slate-500 dark:text-on-surface-variant">
                    Browse agents built by developers who&apos;ve already solved your problem. Fork them, adapt them, or publish your own improvements.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-48 h-48 bg-indigo-200 dark:bg-[#7c7ff5]/30 rounded-full blur-[90px] opacity-40" />
            <div className="bg-white dark:bg-surface shadow-2xl dark:shadow-none dark:ring-1 dark:ring-white/[0.08] rounded-[2.5rem] border border-slate-200 dark:border-transparent p-12 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-10 pb-6 border-b border-slate-100 dark:border-white/[0.06]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-surface-container-highest" />
                  <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-surface-container-highest" />
                  <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-surface-container-highest" />
                </div>
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-on-surface-variant uppercase tracking-[0.2em]">
                  Agent Marketplace
                </span>
              </div>
              <div className="w-full space-y-5">
                <div className="flex items-center gap-5 p-5 rounded-2xl bg-gray-50 dark:bg-surface-container border border-gray-100 dark:border-white/[0.06]">
                  <Database size={20} strokeWidth={1.5} className="text-gray-600 dark:text-gray-400" />
                  <div className="flex-1">
                    <div className="text-slate-900 dark:text-on-surface font-bold text-sm">Supabase Expert Agent</div>
                    <div className="text-slate-500 dark:text-on-surface-variant text-xs mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-0.5">
                        <Star size={10} strokeWidth={2} className="text-amber-400 fill-amber-400" />
                        4.9
                      </span>
                      • 5.2K downloads
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-5 p-5 rounded-2xl border border-slate-100 dark:border-white/[0.06]">
                  <Gauge size={20} strokeWidth={1.5} className="text-slate-400 dark:text-gray-400" />
                  <div className="flex-1">
                    <div className="text-slate-900 dark:text-on-surface font-bold text-sm">Next.js Performance</div>
                    <div className="text-slate-500 dark:text-on-surface-variant text-xs mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-0.5">
                        <Star size={10} strokeWidth={2} className="text-amber-400 fill-amber-400" />
                        4.8
                      </span>
                      • 3.8K downloads
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-5 p-5 rounded-2xl border border-slate-100 dark:border-white/[0.06]">
                  <GitMerge size={20} strokeWidth={1.5} className="text-slate-400 dark:text-gray-400" />
                  <div className="flex-1">
                    <div className="text-slate-900 dark:text-on-surface font-bold text-sm">Full-Stack Orchestrator</div>
                    <div className="text-slate-500 dark:text-on-surface-variant text-xs mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-0.5">
                        <Star size={10} strokeWidth={2} className="text-amber-400 fill-amber-400" />
                        4.8
                      </span>
                      • 4.3K downloads
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
