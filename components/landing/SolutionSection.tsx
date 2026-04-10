import { CheckCircle2 } from 'lucide-react'

const points = [
  'Works for your stack — not against it',
  'Run one agent or ten, on the same problem',
  'Everything the community builds is rated and ready to use',
]

export default function SolutionSection() {
  return (
    <section className="py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-indigo-600 dark:bg-indigo-600/90 rounded-2xl p-8 md:p-14 flex flex-col md:flex-row items-start gap-12">
          <div className="w-full md:w-1/2">
            <span className="text-indigo-300 font-bold tracking-widest text-[10px] uppercase mb-4 block">
              The devCache Solution
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-white leading-tight mb-5">
              What you know, packaged as an agent.
            </h2>
            <p className="text-indigo-100/80 text-base mb-8 leading-relaxed">
              Write down how you&apos;d solve a problem. DevCache turns that into a specialized AI agent — with your rules, your patterns, your standards. Any developer on your team can run it, anytime.
            </p>
            <ul className="space-y-3">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-3 text-white/90 text-sm">
                  <CheckCircle2 size={16} strokeWidth={2} className="text-indigo-300 mt-0.5 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="w-full md:w-1/2">
            <div className="bg-white/10 border border-white/20 rounded-xl p-6 font-mono text-sm">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/15">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                </div>
                <span className="text-white/40 text-[10px] tracking-widest uppercase ml-2">agent.md</span>
              </div>
              <div className="space-y-2 text-[13px] leading-relaxed">
                <p className="text-indigo-200 font-bold"># Auth Flow Reviewer</p>
                <p className="text-white/60">**Role:** Backend security specialist</p>
                <p className="text-white/40 mt-3">## Standards</p>
                <p className="text-white/60">- Always verify JWT on every route</p>
                <p className="text-white/60">- Use RLS — no exceptions</p>
                <p className="text-white/60">- Validate inputs before DB calls</p>
                <p className="text-white/40 mt-3">## Stack</p>
                <p className="text-white/60">Next.js App Router + Supabase</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
