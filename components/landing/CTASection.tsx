import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="py-32 bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(79,70,229,0.35),transparent)]" />
      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-10 tracking-tight">
          Start Building AI Agents Today
        </h2>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-16 leading-relaxed">
          Transform your expertise into executable intelligence. Join professionals building the future of collaborative AI across all disciplines.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link 
            href="/signup"
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-2xl shadow-indigo-900/50 hover:scale-105 transition-all"
          >
            Get Started Free
          </Link>
          <button className="w-full sm:w-auto bg-white/10 text-white border border-white/20 px-12 py-5 rounded-2xl font-bold text-xl hover:bg-white/20 transition-all">
            Talk to Strategy
          </button>
        </div>
        <p className="mt-12 text-slate-500 text-sm font-semibold tracking-wide">
          Free forever for individual professionals. No credit card required.
        </p>
      </div>
    </section>
  )
}
