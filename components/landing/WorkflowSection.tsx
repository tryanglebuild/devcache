export default function WorkflowSection() {
  return (
    <section className="py-32 px-6 md:px-12 relative overflow-hidden section-surface">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <h2 className="text-sm tracking-[0.3em] mb-4 uppercase font-bold text-primary">
            The Workflow
          </h2>
          <p className="text-3xl font-extrabold">Ship Faster, From Day Zero.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
          {/* Connective line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-px bg-gradient-to-r from-transparent via-outline-variant/40 to-transparent -z-10" />
          
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-24 h-24 rounded-full border-4 border-background flex items-center justify-center text-3xl font-bold shadow-xl bg-surface-container-high text-primary">
              1
            </div>
            <div className="space-y-4">
              <h4 className="text-2xl font-bold">Capture</h4>
              <p className="text-on-surface-variant">
                Import existing markdown templates or create new ones directly in our high-fidelity editor. Supports all major syntaxes.
              </p>
              <div className="pt-4 flex justify-center">
                <div className="glass-panel p-3 rounded-lg ghost-border font-mono text-xs text-left">
                  <span className="text-indigo-400"># Auth_Supabase.md</span><br/>
                  <span className="text-slate-500">// Initialize client</span><br/>
                  <span className="text-emerald-400">const supabase = ...</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-24 h-24 rounded-full border-4 border-background flex items-center justify-center text-3xl font-bold shadow-xl bg-surface-container-high text-primary">
              2
            </div>
            <div className="space-y-4">
              <h4 className="text-2xl font-bold">Organize</h4>
              <p className="text-on-surface-variant">
                Group templates into logical project folders. Tag by stack, language, or complexity for instant discovery.
              </p>
              <div className="pt-4 flex flex-wrap gap-2 justify-center">
                <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest border border-indigo-500/30">
                  Next.js
                </span>
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/30">
                  Supabase
                </span>
                <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest border border-amber-500/30">
                  Tailwind
                </span>
              </div>
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-24 h-24 rounded-full border-4 border-background flex items-center justify-center text-3xl font-bold shadow-xl bg-surface-container-high text-primary">
              3
            </div>
            <div className="space-y-4">
              <h4 className="text-2xl font-bold">Reuse</h4>
              <p className="text-on-surface-variant">
                Download logic as ready-to-use snippets or clone the whole folder structure into your new project root.
              </p>
              <button className="mt-4 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 mx-auto ghost-border bg-surface-bright">
                <span className="material-symbols-outlined text-sm text-primary">
                  download
                </span>
                Pull Pattern
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
