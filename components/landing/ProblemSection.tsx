import { RotateCcw, BookOpen, GitBranch, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function ProblemSection() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-surface-container">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-on-surface mb-6">
              Stop Solving the Same Problems
            </h2>
            <p className="text-lg text-slate-600 dark:text-on-surface-variant">
              Teams repeatedly recreate design systems, testing strategies, product frameworks, and technical patterns. Not because they don&apos;t know how—but because expertise isn&apos;t executable.
            </p>
          </div>
          <Link href="#workflow" className="flex items-center gap-2 text-indigo-600 dark:text-[#7c7ff5] font-bold group text-sm">
            See how it works →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-surface p-10 rounded-3xl shadow-sm dark:shadow-none border border-slate-200/60 dark:border-white/[0.06] hover:shadow-md dark:hover:ring-1 dark:hover:ring-white/[0.08] transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-surface-container-high flex items-center justify-center mb-8">
              <RotateCcw size={24} strokeWidth={1.5} className="text-gray-600 dark:text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-on-surface">Repetitive Work</h3>
            <p className="text-slate-500 dark:text-on-surface-variant leading-relaxed">
              Designers recreate component libraries, PMs rebuild roadmap frameworks, developers rewrite auth flows—the same work, over and over.
            </p>
          </div>
          
          <div className="bg-white dark:bg-surface p-10 rounded-3xl shadow-sm dark:shadow-none border border-slate-200/60 dark:border-white/[0.06] hover:shadow-md dark:hover:ring-1 dark:hover:ring-white/[0.08] transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-surface-container-high flex items-center justify-center mb-8">
              <BookOpen size={24} strokeWidth={1.5} className="text-gray-600 dark:text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-on-surface">Lost Expertise</h3>
            <p className="text-slate-500 dark:text-on-surface-variant leading-relaxed">
              Expert knowledge stays locked in individual heads or scattered docs, leaving teams to rediscover best practices constantly across all disciplines.
            </p>
          </div>
          
          <div className="bg-white dark:bg-surface p-10 rounded-3xl shadow-sm dark:shadow-none border border-slate-200/60 dark:border-white/[0.06] hover:shadow-md dark:hover:ring-1 dark:hover:ring-white/[0.08] transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-surface-container-high flex items-center justify-center mb-8">
              <GitBranch size={24} strokeWidth={1.5} className="text-gray-600 dark:text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-on-surface">Inconsistent Standards</h3>
            <p className="text-slate-500 dark:text-on-surface-variant leading-relaxed">
              Each team member approaches problems differently—design patterns, testing strategies, product decisions—leading to fragmented workflows.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
