'use client'

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-24 px-6 md:px-12 hero-gradient grid-bg min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Atmospheric Glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary opacity-10 blur-[120px] rounded-full -z-10" />
      
      <div className="max-w-4xl text-center z-10">
        {/* Beta Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full ghost-border text-xs font-semibold tracking-widest uppercase mb-8 bg-surface-container-high text-primary">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          Now in Private Beta
        </div>

        {/* Hero Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] text-on-background">
          Your Engineering Wisdom, <span className="text-transparent bg-clip-text primary-gradient">Centralized.</span>
        </h1>

        {/* Hero Description */}
        <p className="text-xl max-w-2xl mx-auto mb-12 leading-relaxed text-on-surface-variant">
          Stop rewriting the same Auth, API, and UI patterns. Store your team&apos;s technical DNA in a private, high-velocity repository designed for engineers.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="btn-primary glow-primary-subtle">
            Get Started for Free
          </button>
          <button className="glass-panel px-8 py-4 rounded-xl font-bold text-lg ghost-border-strong hover-surface-bright transition-colors flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined">play_circle</span>
            Watch the Solution
          </button>
        </div>
      </div>

      {/* Hero Visual */}
      <div className="mt-20 w-full max-w-6xl relative">
        <div className="glass-panel ghost-border rounded-2xl p-4 shadow-2xl overflow-hidden">
          {/* Placeholder for screenshot/demo */}
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute -top-6 -right-6 w-32 h-32 glass-panel ghost-border-strong rounded-2xl flex items-center justify-center -rotate-6 hidden lg:flex">
          <span className="material-symbols-outlined text-4xl text-primary" 
                style={{ fontVariationSettings: "'FILL' 1" }}>
            deployed_code
          </span>
        </div>

        <div className="absolute -bottom-10 -left-10 w-48 h-20 glass-panel ghost-border-strong rounded-xl flex items-center px-4 gap-3 rotate-3 hidden lg:flex">
          <div className="h-10 w-10 rounded-full flex items-center justify-center bg-emerald-500/20">
            <span className="material-symbols-outlined text-emerald-400">check_circle</span>
          </div>
          <div className="text-sm">
            <p className="font-bold">Sync Complete</p>
            <p className="text-xs text-on-surface-variant">12.4ms latency</p>
          </div>
        </div>
      </div>
    </section>
  )
}
