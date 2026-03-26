export default function SecuritySection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-indigo-50 border border-indigo-100 rounded-[3rem] px-8 py-20 text-center">
          <span className="material-symbols-outlined text-indigo-600 text-6xl mb-8" style={{ fontVariationSettings: "'FILL' 1" }}>
            shield_lock
          </span>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-8">Enterprise-Grade Privacy</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-16 leading-relaxed">
            Your institutional knowledge is your competitive advantage. devCache is built on a &quot;No-Peek&quot; architecture—meaning your wisdom is encrypted and never leaves your team&apos;s perimeter.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-indigo-100/50">
              <h4 className="font-bold text-slate-900 mb-1">SOC2 Type II</h4>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Compliant</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-indigo-100/50">
              <h4 className="font-bold text-slate-900 mb-1">Zero Trust</h4>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Architecture</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-indigo-100/50">
              <h4 className="font-bold text-slate-900 mb-1">SSO / SAML</h4>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Enterprise Ready</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-indigo-100/50">
              <h4 className="font-bold text-slate-900 mb-1">Self-Host</h4>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Available</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
