import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 -z-10" />
      
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold tracking-[0.2em] uppercase mb-8 border border-indigo-100">
          Knowledge Management Platform
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8 max-w-4xl mx-auto">
          Engineering Wisdom, <br /><span className="text-indigo-600">Centralized.</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 leading-relaxed mb-12">
          The high-fidelity repository for your team&apos;s architectural patterns, technical templates, and collective institutional intelligence.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/signup"
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:translate-y-[-2px] transition-all"
          >
            Start Your Private Cache
          </Link>
          <button className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">
            View Template Library
          </button>
        </div>
      </div>
    </section>
  )
}
