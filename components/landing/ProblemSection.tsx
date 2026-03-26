export default function ProblemSection() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
              The Invisible Cost of Rebuilding
            </h2>
            <p className="text-lg text-slate-600">
              Engineers spend 30% of their time hunting for knowledge they&apos;ve already documented. Fragmentation isn&apos;t just annoying—it&apos;s expensive.
            </p>
          </div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold group cursor-pointer text-sm">
            Read the Velocity Report 
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 mb-8">
              <span className="material-symbols-outlined text-2xl">search_off</span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-slate-900">Template Scavenging</h3>
            <p className="text-slate-500 leading-relaxed">
              Searching through Slack and old docs for specific technical patterns that worked before, but are now buried.
            </p>
          </div>
          
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-8">
              <span className="material-symbols-outlined text-2xl">history</span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-slate-900">Institutional Drift</h3>
            <p className="text-slate-500 leading-relaxed">
              Teams solve the same structural problems differently every time, leading to inconsistent standards and maintenance debt.
            </p>
          </div>
          
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-8">
              <span className="material-symbols-outlined text-2xl">group_off</span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-slate-900">Knowledge Silos</h3>
            <p className="text-slate-500 leading-relaxed">
              Senior wisdom stays locked in private DM history or local documents, leaving juniors to reinvent the wheel daily.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
