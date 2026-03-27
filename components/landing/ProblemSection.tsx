export default function ProblemSection() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
              Stop Solving the Same Problems
            </h2>
            <p className="text-lg text-slate-600">
              Teams repeatedly recreate design systems, testing strategies, product frameworks, and technical patterns. Not because they don&apos;t know how—but because expertise isn&apos;t executable.
            </p>
          </div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold group cursor-pointer text-sm">
            Learn About Agentic AI
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 mb-8">
              <span className="material-symbols-outlined text-2xl">refresh</span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-slate-900">Repetitive Work</h3>
            <p className="text-slate-500 leading-relaxed">
              Designers recreate component libraries, PMs rebuild roadmap frameworks, developers rewrite auth flows—the same work, over and over.
            </p>
          </div>
          
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-8">
              <span className="material-symbols-outlined text-2xl">psychology_alt</span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-slate-900">Lost Expertise</h3>
            <p className="text-slate-500 leading-relaxed">
              Expert knowledge stays locked in individual heads or scattered docs, leaving teams to rediscover best practices constantly across all disciplines.
            </p>
          </div>
          
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-8">
              <span className="material-symbols-outlined text-2xl">speed</span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-slate-900">Inconsistent Standards</h3>
            <p className="text-slate-500 leading-relaxed">
              Each team member approaches problems differently—design patterns, testing strategies, product decisions—leading to fragmented workflows.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
