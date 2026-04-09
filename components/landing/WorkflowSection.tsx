import type { AgentTemplateWithStats } from '@/types/agents.types'

interface WorkflowSectionProps {
  agents?: AgentTemplateWithStats[]
}

export default function WorkflowSection({ agents = [] }: WorkflowSectionProps) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">From Expertise to Execution</h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Three simple steps to transform your development knowledge into shareable, executable AI agents.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Create Agent */}
          <div className="md:col-span-7 bg-slate-50 rounded-[2.5rem] p-12 flex flex-col justify-between border border-slate-100 overflow-hidden relative group min-h-[500px]">
            <div className="relative z-10">
              <span className="text-indigo-600 font-extrabold mb-3 block text-xs tracking-[0.2em] uppercase">
                Step 01
              </span>
              <h3 className="text-3xl font-extrabold mb-6 text-slate-900">Create Your Agent</h3>
              <p className="text-slate-600 max-w-sm mb-10 text-lg leading-relaxed">
                Define your agent&apos;s expertise, behavioral rules, and capabilities. Use our intuitive editor or describe what you want in plain English.
              </p>
              <div className="inline-flex items-center gap-3 bg-white px-6 py-4 rounded-2xl border border-slate-200 text-sm font-bold shadow-sm">
                <span className="material-symbols-outlined text-gray-600">smart_toy</span>
                <span className="text-slate-800">New AI Agent</span>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 w-2/3 h-1/2 translate-y-6 translate-x-6">
              <div className="bg-white rounded-tl-[2rem] shadow-2xl p-8 border-l border-t border-slate-100">
                <div className="h-4 w-40 bg-slate-100 rounded-full mb-8" />
                <div className="space-y-4">
                  <div className="h-4 w-full bg-indigo-50/50 rounded-full" />
                  <div className="h-4 w-full bg-indigo-50/50 rounded-full" />
                  <div className="h-4 w-4/5 bg-slate-50 rounded-full" />
                  <div className="h-4 w-2/3 bg-slate-50 rounded-full" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Publish or Share */}
          <div className="md:col-span-5 bg-indigo-50 rounded-[2.5rem] p-12 flex flex-col border border-indigo-100 overflow-hidden min-h-[500px]">
            <span className="text-indigo-600 font-extrabold mb-3 block text-xs tracking-[0.2em] uppercase">
              Step 02
            </span>
            <h3 className="text-3xl font-extrabold mb-6 text-slate-900">Publish & Share</h3>
            <p className="text-slate-600 mb-10 text-lg leading-relaxed">
              Share your agent with the world or keep it private for your team. Build your reputation in the marketplace.
            </p>
            <div className="mt-auto flex flex-wrap gap-3">
              <span className="px-5 py-3 bg-white rounded-xl text-[11px] font-extrabold text-indigo-600 border border-indigo-200 uppercase flex items-center gap-2 tracking-wider">
                <span className="material-symbols-outlined text-[16px]">public</span> Public
              </span>
              <span className="px-5 py-3 bg-white rounded-xl text-[11px] font-extrabold text-indigo-600 border border-indigo-200 uppercase flex items-center gap-2 tracking-wider">
                <span className="material-symbols-outlined text-[16px]">lock</span> Private
              </span>
              <span className="px-5 py-3 bg-white rounded-xl text-[11px] font-extrabold text-indigo-600 border border-indigo-200 uppercase flex items-center gap-2 tracking-wider">
                <span className="material-symbols-outlined text-[16px]">groups</span> Team
              </span>
              <span className="px-5 py-3 bg-white rounded-xl text-[11px] font-extrabold text-indigo-600 border border-indigo-200 uppercase flex items-center gap-2 tracking-wider">
                <span className="material-symbols-outlined text-[16px]">star</span> Rate
              </span>
            </div>
          </div>
          
          {/* Use & Orchestrate */}
          <div className="md:col-span-12 bg-slate-900 rounded-[2.5rem] p-12 lg:p-16 flex flex-col md:flex-row items-center gap-16 border border-slate-800 mt-8">
            <div className="md:w-1/2">
              <span className="text-indigo-400 font-extrabold mb-3 block text-xs tracking-[0.2em] uppercase">
                Step 03
              </span>
              <h3 className="text-3xl lg:text-4xl font-extrabold text-white mb-6">Use & Orchestrate</h3>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                Execute agents individually or orchestrate multiple agents to tackle complex problems. Watch them collaborate and deliver expert-level results.
              </p>
              <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/40">
                Explore Marketplace
              </button>
            </div>
            <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {agents.map((agent) => (
                <div key={agent.id} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 flex items-center gap-4 hover:bg-slate-800 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-gray-700/50 flex items-center justify-center text-gray-400">
                    <span className="material-symbols-outlined text-2xl">smart_toy</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-bold text-sm truncate">{agent.name}</div>
                    <div className="text-slate-500 text-xs flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px] text-gray-400">star</span>
                      {(agent.rating_average || 0).toFixed(1)} • {agent.download_count || 0} downloads
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
