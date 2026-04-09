export default function SecuritySection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-indigo-50 border border-indigo-100 rounded-[3rem] px-8 py-20 text-center">
          <span className="material-symbols-outlined text-gray-600 text-6xl mb-8" style={{ fontVariationSettings: "'FILL' 1" }}>
            verified_user
          </span>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-8">Secure & Trustworthy</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-16 leading-relaxed">
            Your agents and data are protected with enterprise-grade security. Community ratings and reviews ensure quality, while private agents keep your proprietary knowledge secure.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-indigo-100/50">
              <h4 className="font-bold text-slate-900 mb-1">Community Rated</h4>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">5-Star System</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-indigo-100/50">
              <h4 className="font-bold text-slate-900 mb-1">Private Agents</h4>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Team Only</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-indigo-100/50">
              <h4 className="font-bold text-slate-900 mb-1">Encrypted</h4>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">End-to-End</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-indigo-100/50">
              <h4 className="font-bold text-slate-900 mb-1">Version Control</h4>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Full History</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
