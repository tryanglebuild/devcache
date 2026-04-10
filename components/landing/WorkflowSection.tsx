import Link from 'next/link'
import { FilePlus2, Globe2, Lock, Users, Star, Layers } from 'lucide-react'
import type { AgentTemplateWithStats } from '@/types/agents.types'

interface WorkflowSectionProps {
  agents?: AgentTemplateWithStats[]
}

export default function WorkflowSection({ agents = [] }: WorkflowSectionProps) {
  return (
    <section id="workflow" className="py-20 bg-white dark:bg-surface">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-16">
          <span className="text-indigo-600 dark:text-[#7c7ff5] font-bold tracking-widest text-[10px] uppercase mb-3 block">How it works</span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-on-surface mb-3 tracking-tight">From expertise to execution.</h2>
          <p className="text-slate-500 dark:text-on-surface-variant text-base max-w-lg">
            Three steps to transform your development knowledge into shareable, executable AI agents.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Create Agent */}
          <div className="md:col-span-7 bg-slate-50 dark:bg-surface-container rounded-2xl p-8 flex flex-col justify-between border border-slate-100 dark:border-white/[0.06] overflow-hidden relative group min-h-[420px]">
            <div className="relative z-10">
              <span className="text-indigo-600 dark:text-[#7c7ff5] font-bold mb-2 block text-[10px] tracking-widest uppercase">
                Step 01
              </span>
              <h3 className="text-xl font-black mb-3 text-slate-900 dark:text-on-surface">Create your agent</h3>
              <p className="text-slate-500 dark:text-on-surface-variant max-w-sm mb-8 text-sm leading-relaxed">
                Define your agent&apos;s expertise, behavioral rules, and capabilities. Use our intuitive editor or describe what you want in plain English.
              </p>
              <div className="inline-flex items-center gap-2.5 bg-white dark:bg-surface dark:border-white/[0.06] px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 dark:text-on-surface">
                <FilePlus2 size={16} strokeWidth={1.5} className="text-slate-400 dark:text-gray-400" />
                New AI Agent
              </div>
            </div>
            <div className="absolute right-0 bottom-0 w-2/3 h-1/2 translate-y-4 translate-x-4">
              <div className="bg-white dark:bg-surface dark:shadow-none dark:border-white/[0.06] rounded-tl-2xl shadow-xl p-6 border-l border-t border-slate-100">
                <div className="h-3 w-32 bg-slate-100 dark:bg-surface-container-high rounded-full mb-6" />
                <div className="space-y-3">
                  <div className="h-3 w-full bg-indigo-50 dark:bg-[#7c7ff5]/10 rounded-full" />
                  <div className="h-3 w-full bg-indigo-50 dark:bg-[#7c7ff5]/10 rounded-full" />
                  <div className="h-3 w-4/5 bg-slate-50 dark:bg-surface-container rounded-full" />
                  <div className="h-3 w-2/3 bg-slate-50 dark:bg-surface-container rounded-full" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Publish or Share */}
          <div className="md:col-span-5 bg-indigo-50 dark:bg-[#7c7ff5]/10 rounded-2xl p-8 flex flex-col border border-indigo-100 dark:border-[#7c7ff5]/20 overflow-hidden min-h-[420px]">
            <span className="text-indigo-600 dark:text-[#7c7ff5] font-bold mb-2 block text-[10px] tracking-widest uppercase">
              Step 02
            </span>
            <h3 className="text-xl font-black mb-3 text-slate-900 dark:text-on-surface">Publish & share</h3>
            <p className="text-slate-600 dark:text-on-surface-variant mb-8 text-sm leading-relaxed">
              Share your agent with the world or keep it private for your team. Build your reputation in the marketplace.
            </p>
            <div className="mt-auto flex flex-wrap gap-2">
              {([
                { icon: Globe2, label: 'Public' },
                { icon: Lock, label: 'Private' },
                { icon: Users, label: 'Team' },
                { icon: Star, label: 'Rate' },
              ] as const).map(({ icon: Icon, label }) => (
                <span key={label} className="px-4 py-2 bg-white dark:bg-surface rounded-lg text-[11px] font-bold text-indigo-600 dark:text-[#7c7ff5] border border-indigo-200 dark:border-[#7c7ff5]/30 uppercase flex items-center gap-1.5 tracking-wider">
                  <Icon size={12} strokeWidth={2} /> {label}
                </span>
              ))}
            </div>
          </div>
          
          {/* Use & Orchestrate */}
          <div className="md:col-span-12 bg-slate-900 dark:bg-[#0d1121] rounded-2xl p-8 lg:p-12 flex flex-col md:flex-row items-start gap-12 border border-slate-800 dark:border-white/[0.06] mt-2">
            <div className="md:w-1/2">
              <span className="text-indigo-400 font-bold mb-2 block text-[10px] tracking-widest uppercase">
                Step 03
              </span>
              <h3 className="text-xl lg:text-2xl font-black text-white mb-3">Use & orchestrate</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Execute agents individually or orchestrate multiple agents to tackle complex problems. Watch them collaborate and deliver expert-level results.
              </p>
              <Link href="/marketplace" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                Explore Marketplace
              </Link>
            </div>
            <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {agents.map((agent) => (
                <div key={agent.id} className="bg-white/[0.04] p-4 rounded-xl border border-white/[0.07] flex items-center gap-3 hover:bg-white/[0.07] transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                    <Layers size={16} strokeWidth={1.5} className="text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-semibold text-sm truncate">{agent.name}</div>
                    <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                      <Star size={10} strokeWidth={2} className="text-slate-500" />
                      {(agent.rating_average || 0).toFixed(1)} · {agent.download_count || 0} dl
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
