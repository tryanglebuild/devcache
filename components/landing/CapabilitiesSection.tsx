export default function CapabilitiesSection() {
  return (
    <section className="py-24 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-8 tracking-tight">
              Specialized Intelligence
            </h2>
            <p className="text-slate-600 text-lg mb-12 leading-relaxed">
              Each agent is a domain expert, trained on best practices and patterns. They don&apos;t just provide answers—they guide you through complex implementations with context-aware intelligence.
            </p>
            <div className="space-y-8">
              <div className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-200 text-indigo-600">
                  <span className="material-symbols-outlined text-xl">psychology</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Multi-Agent Orchestration</h4>
                  <p className="text-slate-500">
                    Coordinate multiple specialized agents to solve complex problems collaboratively.
                  </p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-200 text-indigo-600">
                  <span className="material-symbols-outlined text-xl">store</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Community Marketplace</h4>
                  <p className="text-slate-500">
                    Access thousands of agents created by expert developers, rated and reviewed by the community.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-48 h-48 bg-indigo-200 rounded-full blur-[90px] opacity-40" />
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 p-12 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                </div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">
                  Agent Marketplace
                </span>
              </div>
              <div className="w-full space-y-5">
                <div className="flex items-center gap-5 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                  <span className="material-symbols-outlined text-indigo-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                    smart_toy
                  </span>
                  <div className="flex-1">
                    <div className="text-slate-900 font-bold text-sm">Supabase Expert Agent</div>
                    <div className="text-slate-500 text-xs mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[10px] text-yellow-400">star</span>
                        4.9
                      </span>
                      • 5.2K downloads
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-5 p-5 rounded-2xl border border-slate-100">
                  <span className="material-symbols-outlined text-slate-400">smart_toy</span>
                  <div className="flex-1">
                    <div className="text-slate-900 font-bold text-sm">Next.js Performance</div>
                    <div className="text-slate-500 text-xs mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[10px] text-yellow-400">star</span>
                        4.8
                      </span>
                      • 3.8K downloads
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-5 p-5 rounded-2xl border border-slate-100">
                  <span className="material-symbols-outlined text-slate-400">psychology</span>
                  <div className="flex-1">
                    <div className="text-slate-900 font-bold text-sm">Full-Stack Orchestrator</div>
                    <div className="text-slate-500 text-xs mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[10px] text-yellow-400">star</span>
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
