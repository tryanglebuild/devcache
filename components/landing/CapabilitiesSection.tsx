export default function CapabilitiesSection() {
  return (
    <section className="py-24 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-8 tracking-tight">
              Structured Wisdom Storage
            </h2>
            <p className="text-slate-600 text-lg mb-12 leading-relaxed">
              We don&apos;t believe in messy folders. Your institutional knowledge is stored in high-fidelity technical templates, rendered with professional clarity. Full support for diagrams, architectural mapping, and specifications.
            </p>
            <div className="space-y-8">
              <div className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-200 text-indigo-600">
                  <span className="material-symbols-outlined text-xl">article</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Live Technical Guidelines</h4>
                  <p className="text-slate-500">
                    Collaboratively update and refine team wisdom in real-time, no stale docs.
                  </p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-200 text-indigo-600">
                  <span className="material-symbols-outlined text-xl">hub</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Project-Linked Intelligence</h4>
                  <p className="text-slate-500">
                    Automatically surface relevant templates based on your active project context.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-48 h-48 bg-indigo-200 rounded-full blur-[90px] opacity-40" />
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 p-12 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                </div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">
                  Knowledge Base Explorer
                </span>
              </div>
              <div className="w-full space-y-5">
                <div className="flex items-center gap-5 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                  <span className="material-symbols-outlined text-indigo-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                    description
                  </span>
                  <div>
                    <div className="text-slate-900 font-bold text-sm">System Architecture V2</div>
                    <div className="text-slate-500 text-xs mt-1">Template • Last updated 2d ago</div>
                  </div>
                </div>
                <div className="flex items-center gap-5 p-5 rounded-2xl border border-slate-100">
                  <span className="material-symbols-outlined text-slate-400">topic</span>
                  <div>
                    <div className="text-slate-900 font-bold text-sm">Service Integration Guide</div>
                    <div className="text-slate-500 text-xs mt-1">Guideline • Core Infrastructure</div>
                  </div>
                </div>
                <div className="flex items-center gap-5 p-5 rounded-2xl border border-slate-100">
                  <span className="material-symbols-outlined text-slate-400">rule</span>
                  <div>
                    <div className="text-slate-900 font-bold text-sm">Authentication Playbook</div>
                    <div className="text-slate-500 text-xs mt-1">Checklist • Security Standards</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
