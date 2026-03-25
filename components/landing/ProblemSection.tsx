import Image from 'next/image'

export default function ProblemSection() {
  return (
    <section className="py-24 px-6 md:px-12 relative section-surface-dim" id="problem">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1 space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              The Invisible Cost of <span className="text-error">Rebuilding.</span>
            </h2>
            <p className="text-lg leading-relaxed text-on-surface-variant">
              Every day, developers lose hours hunting through old repositories for snippets of logic they&apos;ve already written. Knowledge is fragmented, documentation is stale, and the same wheels are reinvented every sprint.
            </p>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="flex gap-4 items-start p-6 rounded-2xl ghost-border bg-surface-container-low">
                <span className="material-symbols-outlined p-2 rounded-lg text-error bg-error/10">
                  search_off
                </span>
                <div>
                  <h4 className="font-bold text-lg">Where did I write that?</h4>
                  <p className="text-sm text-on-surface-variant">
                    Searching through Slack, GitHub, and Notion just to find one Supabase Auth hook.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start p-6 rounded-2xl ghost-border bg-surface-container-low">
                <span className="material-symbols-outlined p-2 rounded-lg text-error bg-error/10">
                  history
                </span>
                <div>
                  <h4 className="font-bold text-lg">The &quot;New Repo&quot; Tax</h4>
                  <p className="text-sm text-on-surface-variant">
                    Wasting 4 hours setting up boilerplate patterns that your team already perfected last month.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <div className="relative aspect-square md:aspect-video rounded-3xl overflow-hidden ghost-border bg-surface-container-lowest">
              <Image 
                alt="Chaos vs Order" 
                className="w-full h-full object-cover opacity-40 grayscale"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYmZHSCAA5qF-0T73_S6oNSWAab51NkeVOGQnfJzszlXJmjtsV4JXMWIBsNoEAnJOrer0PerQIBBXPcgD6bJ7hmnPVelFjHSY_uhuzfYhiGGuHtwwjgL4tafV_AkixhMCjAM1YcAGs0cXLxgx9hxKd9RBWq7m0oxCrR1AQUWRog4D54Op39RyePBFlIIVqcGGI08fn1zrxt1rS0GHdaSV_883aAXHQeSya2UHN7eQCbGlJb2rIG3mTxJRXh43GiAgaOJGzTCLwxesh"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-8 glass-panel ghost-border-strong rounded-2xl text-center max-w-xs shadow-2xl">
                  <span className="material-symbols-outlined text-5xl mb-4 text-error">
                    warning
                  </span>
                  <p className="font-mono text-sm text-error">
                    CRITICAL_INEFFICIENCY_DETECTED
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-widest text-on-surface-variant">
                    Wasted Engineering Capital
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
