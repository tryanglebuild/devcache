import { RotateCcw, BookOpen, GitBranch } from 'lucide-react'
import Link from 'next/link'

const problems = [
  {
    icon: RotateCcw,
    title: 'Repetitive Work',
    body: 'Designers recreate component libraries, PMs rebuild roadmap frameworks, developers rewrite auth flows — the same work, over and over.',
  },
  {
    icon: BookOpen,
    title: 'Lost Expertise',
    body: 'Expert knowledge stays locked in individual heads or scattered docs, leaving teams to rediscover best practices constantly.',
  },
  {
    icon: GitBranch,
    title: 'Inconsistent Standards',
    body: 'Each team member approaches problems differently — design patterns, testing strategies, product decisions — leading to fragmented workflows.',
  },
]

export default function ProblemSection() {
  return (
    <section className="py-20 bg-slate-50/70 dark:bg-surface-container border-y border-slate-100 dark:border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6">
          <div className="max-w-lg">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-on-surface mb-3 tracking-tight">
              Stop solving the same problems.
            </h2>
            <p className="text-slate-500 dark:text-on-surface-variant text-base leading-relaxed">
              Teams repeatedly recreate patterns that already exist — because expertise isn&apos;t executable.
            </p>
          </div>
          <Link href="#workflow" className="text-indigo-600 dark:text-[#7c7ff5] font-semibold text-sm hover:opacity-75 transition-opacity shrink-0">
            See how it works →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-200 dark:bg-white/[0.06] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.06]">
          {problems.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-white dark:bg-surface p-8">
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-surface-container flex items-center justify-center mb-6">
                <Icon size={18} strokeWidth={1.5} className="text-slate-500 dark:text-slate-400" />
              </div>
              <h3 className="text-base font-bold mb-3 text-slate-900 dark:text-on-surface">{title}</h3>
              <p className="text-slate-500 dark:text-on-surface-variant text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
