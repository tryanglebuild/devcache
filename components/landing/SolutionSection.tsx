import { CheckCircle2, Monitor, GitMerge, Database } from 'lucide-react'

export default function SolutionSection() {
  return (
    <section className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-indigo-600 rounded-[3rem] p-8 md:p-16 lg:p-20 flex flex-col md:flex-row items-center gap-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-[-20deg] translate-x-32" />
          
          <div className="w-full md:w-1/2 relative z-10">
            <span className="text-indigo-200 font-extrabold tracking-[0.2em] text-[10px] uppercase mb-6 block">
              The devCache Solution
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-[1.15] mb-8">
              What you know, packaged as an agent.
            </h2>
            <p className="text-indigo-100 text-lg mb-10 leading-relaxed">
              Write down how you&apos;d solve a problem. DevCache turns that into a specialized AI agent — with your rules, your patterns, your standards. Any developer on your team can run it, anytime.
            </p>
            <ul className="space-y-5">
              <li className="flex items-center gap-4 text-white font-semibold">
                <CheckCircle2 size={20} strokeWidth={2} className="text-indigo-300 fill-indigo-300" />
                Works for your stack — not against it
              </li>
              <li className="flex items-center gap-4 text-white font-semibold">
                <CheckCircle2 size={20} strokeWidth={2} className="text-indigo-300 fill-indigo-300" />
                Run one agent or ten, on the same problem
              </li>
              <li className="flex items-center gap-4 text-white font-semibold">
                <CheckCircle2 size={20} strokeWidth={2} className="text-indigo-300 fill-indigo-300" />
                Everything the community builds is rated and ready to use
              </li>
            </ul>
          </div>
          
          <div className="w-full md:w-1/2 relative z-10">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-12 rounded-3xl shadow-2xl flex items-center justify-center min-h-[350px]">
              <div className="grid grid-cols-3 gap-8">
                <div className="w-24 h-28 bg-white/15 rounded-2xl flex flex-col items-center justify-center gap-3 border border-white/25 backdrop-blur-sm">
                  <Monitor size={40} strokeWidth={1} className="text-white" />
                  <div className="w-12 h-1.5 bg-white/30 rounded-full" />
                  <div className="text-[8px] font-bold text-white/90">Next.js</div>
                </div>
                <div className="w-24 h-28 bg-white/25 rounded-2xl flex flex-col items-center justify-center gap-3 border border-white/40 scale-110 shadow-2xl">
                  <GitMerge size={40} strokeWidth={1} className="text-white" />
                  <div className="w-14 h-1.5 bg-white/40 rounded-full" />
                  <div className="text-[8px] font-bold text-white/90">Orchestrator</div>
                </div>
                <div className="w-24 h-28 bg-white/15 rounded-2xl flex flex-col items-center justify-center gap-3 border border-white/25 backdrop-blur-sm">
                  <Database size={40} strokeWidth={1} className="text-white" />
                  <div className="w-12 h-1.5 bg-white/30 rounded-full" />
                  <div className="text-[8px] font-bold text-white/90">Supabase</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
