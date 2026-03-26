export default function SolutionSection() {
  return (
    <section className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-indigo-600 rounded-[3rem] p-8 md:p-16 lg:p-20 flex flex-col md:flex-row items-center gap-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-[-20deg] translate-x-32" />
          
          <div className="w-full md:w-1/2 relative z-10">
            <span className="text-indigo-200 font-extrabold tracking-[0.2em] text-[10px] uppercase mb-6 block">
              The devCache Advantage
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-[1.15] mb-8">
              The Project-Centric Knowledge Hub
            </h2>
            <p className="text-indigo-100 text-lg mb-10 leading-relaxed">
              devCache is a vault for your engineering intellectual property. It links your technical templates and wisdom directly to projects, stacks, and teams.
            </p>
            <ul className="space-y-5">
              <li className="flex items-center gap-4 text-white font-semibold">
                <span className="material-symbols-outlined text-indigo-300 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                Searchable by project context
              </li>
              <li className="flex items-center gap-4 text-white font-semibold">
                <span className="material-symbols-outlined text-indigo-300 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                Structured template library
              </li>
              <li className="flex items-center gap-4 text-white font-semibold">
                <span className="material-symbols-outlined text-indigo-300 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                Team-wide access controls
              </li>
            </ul>
          </div>
          
          <div className="w-full md:w-1/2 relative z-10">
            <div className="bg-white/70 backdrop-blur-xl border border-indigo-100/50 p-12 rounded-3xl shadow-2xl flex items-center justify-center min-h-[350px]">
              <div className="grid grid-cols-3 gap-8">
                <div className="w-24 h-28 bg-white/20 rounded-2xl flex flex-col items-center justify-center gap-3 border border-white/30 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-indigo-600 text-4xl">description</span>
                  <div className="w-12 h-1.5 bg-indigo-200 rounded-full" />
                </div>
                <div className="w-24 h-28 bg-white/40 rounded-2xl flex flex-col items-center justify-center gap-3 border border-white/50 scale-110 shadow-2xl">
                  <span className="material-symbols-outlined text-indigo-600 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    folder_special
                  </span>
                  <div className="w-14 h-1.5 bg-indigo-300 rounded-full" />
                </div>
                <div className="w-24 h-28 bg-white/20 rounded-2xl flex flex-col items-center justify-center gap-3 border border-white/30 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-indigo-600 text-4xl">inventory</span>
                  <div className="w-12 h-1.5 bg-indigo-200 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
