import Link from 'next/link'
import { FilePlus2, Globe2, Lock, Users, Star, Layers } from 'lucide-react'
import type { AgentTemplateWithStats } from '@/types/agents.types'

interface WorkflowSectionProps {
  agents?: AgentTemplateWithStats[]
}

export default function WorkflowSection({ agents = [] }: WorkflowSectionProps) {
  return (
    <section id="workflow" className="py-24 bg-white dark:bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-on-surface mb-4">From Expertise to Execution</h2>
          <p className="text-slate-500 dark:text-on-surface-variant text-lg max-w-2xl mx-auto">
            Three simple steps to transform your development knowledge into shareable, executable AI agents.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Create Agent */}
          <div className="md:col-span-7 bg-slate-50 dark:bg-surface-container rounded-[2.5rem] p-12 flex flex-col justify-between border border-slate-100 dark:border-white/[0.06] overflow-hidden relative group min-h-[500px]">
            <div className="relative z-10">
              <span className="text-indigo-600 dark:text-[#7c7ff5] font-extrabold mb-3 block text-xs tracking-[0.2em] uppercase">
                Step 01
              </span>
              <h3 className="text-3xl font-extrabold mb-6 text-slate-900 dark:text-on-surface">Create Your Agent</h3>
              <p className="text-slate-600 dark:text-on-surface-variant max-w-sm mb-10 text-lg leading-relaxed">
                Define your agent&apos;s expertise, behavioral rules, and capabilities. Use our intuitive editor or describe what you want in plain English.
              </p>
              <div className="inline-flex items-center gap-3 bg-white dark:bg-surface dark:border-white/[0.06] dark:shadow-none px-6 py-4 rounded-2xl border border-slate-200 text-sm font-bold shadow-sm">
                <FilePlus2 size={20} strokeWidth={1.5} className="text-gray-600 dark:text-gray-400" />
                <span className="text-slate-800 dark:text-on-surface">New AI Agent</span>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 w-2/3 h-1/2 translate-y-6 translate-x-6">
              <div className="bg-white dark:bg-surface dark:shadow-none dark:border-white/[0.06] rounded-tl-[2rem] shadow-2xl p-8 border-l border-t border-slate-100">
                <div className="h-4 w-40 bg-slate-100 dark:bg-surface-container-high rounded-full mb-8" />
                <div className="space-y-4">
                  <div className="h-4 w-full bg-indigo-50/50 dark:bg-[#7c7ff5]/10 rounded-full" />
                  <div className="h-4 w-full bg-indigo-50/50 dark:bg-[#7c7ff5]/10 rounded-full" />
                  <div className="h-4 w-4/5 bg-slate-50 dark:bg-surface-container rounded-full" />
                  <div className="h-4 w-2/3 bg-slate-50 dark:bg-surface-container rounded-full" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Publish or Share */}
          <div className="md:col-span-5 bg-indigo-50 dark:bg-[#7c7ff5]/10 rounded-[2.5rem] p-12 flex flex-col border border-indigo-100 dark:border-[#7c7ff5]/20 overflow-hidden min-h-[500px]">
            <span className="text-indigo-600 dark:text-[#7c7ff5] font-extrabold mb-3 block text-xs tracking-[0.2em] uppercase">
              Step 02
            </span>
            <h3 className="text-3xl font-extrabold mb-6 text-slate-900 dark:text-on-surface">Publish & Share</h3>
            <p className="text-slate-600 dark:text-on-surface-variant mb-10 text-lg leading-relaxed">
              Share your agent with the world or keep it private for your team. Build your reputation in the marketplace.
            </p>
            <div className="mt-auto flex flex-wrap gap-3">
              <span className="px-5 py-3 bg-white dark:bg-surface rounded-xl text-[11px] font-extrabold text-indigo-600 dark:text-[#7c7ff5] border border-indigo-200 dark:border-[#7c7ff5]/30 uppercase flex items-center gap-2 tracking-wider">
                <Globe2 size={14} strokeWidth={2} className="text-indigo-600 dark:text-[#7c7ff5]" /> Public
              </span>
              <span className="px-5 py-3 bg-white dark:bg-surface rounded-xl text-[11px] font-extrabold text-indigo-600 dark:text-[#7c7ff5] border border-indigo-200 dark:border-[#7c7ff5]/30 uppercase flex items-center gap-2 tracking-wider">
                <Lock size={14} strokeWidth={2} /> Private
              </span>
              <span className="px-5 py-3 bg-white dark:bg-surface rounded-xl text-[11px] font-extrabold text-indigo-600 dark:text-[#7c7ff5] border border-indigo-200 dark:border-[#7c7ff5]/30 uppercase flex items-center gap-2 tracking-wider">
                <Users size={14} strokeWidth={2} /> Team
              </span>
              <span className="px-5 py-3 bg-white dark:bg-surface rounded-xl text-[11px] font-extrabold text-indigo-600 dark:text-[#7c7ff5] border border-indigo-200 dark:border-[#7c7ff5]/30 uppercase flex items-center gap-2 tracking-wider">
                <Star size={14} strokeWidth={2} /> Rate
              </span>
            </div>
          </div>
          
          {/* Use & Orchestrate */}
          <div className="md:col-span-12 bg-slate-900 dark:bg-slate-800 rounded-[2.5rem] p-12 lg:p-16 flex flex-col md:flex-row items-center gap-16 border border-slate-800 dark:border-slate-700/50 mt-8">
            <div className="md:w-1/2">
              <span className="text-indigo-400 font-extrabold mb-3 block text-xs tracking-[0.2em] uppercase">
                Step 03
              </span>
              <h3 className="text-3xl lg:text-4xl font-extrabold text-white mb-6">Use & Orchestrate</h3>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                Execute agents individually or orchestrate multiple agents to tackle complex problems. Watch them collaborate and deliver expert-level results.
              </p>
              <Link href="/marketplace" className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/40">
                Explore Marketplace
              </Link>
            </div>
            <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {agents.map((agent) => (
                <div key={agent.id} className="bg-slate-800/50 dark:bg-slate-700/30 p-6 rounded-2xl border border-slate-700/50 dark:border-slate-600/50 flex items-center gap-4 hover:bg-slate-800 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-gray-700/50 flex items-center justify-center text-gray-400">
                    <Layers size={24} strokeWidth={1.5} className="text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-bold text-sm truncate">{agent.name}</div>
                    <div className="text-slate-500 text-xs flex items-center gap-1">
                      <Star size={10} strokeWidth={2} className="text-gray-400" />
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
