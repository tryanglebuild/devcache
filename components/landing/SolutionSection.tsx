export default function SolutionSection() {
  return (
    <section className="py-24 px-6 md:px-12 border-y border-outline-variant/10 section-surface-container-low" id="solution">
      <div className="max-w-4xl mx-auto text-center mb-20">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          Meet Your <span className="text-primary">Project-Centric</span> Hub.
        </h2>
        <p className="text-lg text-on-surface-variant">
          devCache isn&apos;t another social network or snippet manager. It&apos;s a high-performance vault for your engineering team&apos;s intellectual property. Private, secure, and built for speed.
        </p>
      </div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="card hover:border-primary/40">
          <span className="material-symbols-outlined text-4xl mb-6 block group-hover:scale-110 transition-transform text-primary">
            lock
          </span>
          <h3 className="text-2xl font-bold mb-4">Team Privacy First</h3>
          <p className="leading-relaxed text-on-surface-variant">
            Your patterns stay yours. devCache creates a secure perimeter around your proprietary technical solutions.
          </p>
        </div>
        
        <div className="card hover:border-primary/40">
          <span className="material-symbols-outlined text-4xl mb-6 block group-hover:scale-110 transition-transform text-primary">
            account_tree
          </span>
          <h3 className="text-2xl font-bold mb-4">Project Lineage</h3>
          <p className="leading-relaxed text-on-surface-variant">
            Organize knowledge by specific projects. Understand exactly where and how a pattern was first implemented.
          </p>
        </div>
        
        <div className="card hover:border-primary/40">
          <span className="material-symbols-outlined text-4xl mb-6 block group-hover:scale-110 transition-transform text-primary">
            bolt
          </span>
          <h3 className="text-2xl font-bold mb-4">Low Latency Dev</h3>
          <p className="leading-relaxed text-on-surface-variant">
            Built on a distributed edge architecture. Your cache is always one keyboard shortcut away from implementation.
          </p>
        </div>
      </div>
    </section>
  )
}
