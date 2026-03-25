import Image from 'next/image'

export default function CapabilitiesSection() {
  return (
    <section className="py-24 px-6 md:px-12 space-y-32">
      {/* Markdown Render */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 order-2 md:order-1">
          <div className="code-window">
            <div className="code-window-header">
              <div className="code-window-dots">
                <div className="code-window-dot code-window-dot-red" />
                <div className="code-window-dot code-window-dot-yellow" />
                <div className="code-window-dot code-window-dot-green" />
              </div>
              <span className="text-xs font-mono text-on-surface-variant">
                useAuth_hook.ts
              </span>
            </div>
            <div className="p-8 font-mono text-sm overflow-x-auto bg-surface-container-lowest">
              <pre><code>
                <span className="text-indigo-400">export const</span> <span className="text-tertiary">useAuth</span> = () =&gt; {'{'}
                {'\n  '}<span className="text-slate-500">// Private logic cached from Project Alpha</span>
                {'\n  '}<span className="text-primary-container">const</span> [user, setUser] = <span className="text-tertiary">useState</span>(<span className="text-on-surface-variant">null</span>);
                {'\n\n  '}<span className="text-indigo-400">useEffect</span>(() =&gt; {'{'}
                {'\n    '}<span className="text-slate-500">// Implementation details...</span>
                {'\n    '}<span className="text-emerald-400">const</span> {'{'} data {'}'} = supabase.auth.<span className="text-tertiary">onAuthStateChange</span>();
                {'\n  }'}, []);
                {'\n\n  '}<span className="text-indigo-400">return</span> {'{'} user {'}'};
                {'\n}'};
              </code></pre>
            </div>
          </div>
        </div>
        
        <div className="flex-1 order-1 md:order-2 space-y-6">
          <h3 className="text-3xl font-bold">Markdown First Experience</h3>
          <p className="text-lg text-on-surface-variant">
            The code you write is the knowledge you store. Beautifully rendered markdown with syntax highlighting for 120+ languages. It&apos;s like your personal, high-speed documentation site.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">done_all</span>
              <span>Copy-to-clipboard integration</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">done_all</span>
              <span>Versioned snippet history</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Project Linked */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 space-y-6">
          <h3 className="text-3xl font-bold">Project-Linked Intelligence</h3>
          <p className="text-lg text-on-surface-variant">
            Don&apos;t just store code; store context. Track which patterns belong to which specific customer or internal project folder. Maintain a lineage of innovation.
          </p>
          <div className="card">
            <div className="flex items-center gap-4 mb-4">
              <span className="material-symbols-outlined text-amber-400">folder_open</span>
              <span className="font-bold">E-Commerce_Legacy_V2</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs opacity-70">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">description</span> Stripe_Integration.md
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">description</span> Webhook_Security.md
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 relative aspect-video">
          <Image 
            alt="Project Organization" 
            className="rounded-3xl shadow-2xl border border-outline-variant/20"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCW7g_RzRGurgbpX6lbNySvNsXNYjQoaS1HTnaP31p4evaAsqlXZlw8zUPI2v6cteSY67qQ78gvfJ09os01bP4nJA70DlVZwbt2mPcVzngpFIkr6WPKkLXTJzJmvSbP4PEVOeQHOVv_-OX-7kiUEGwuyHDEqNaJaj9CpMV6qeC2N7CI3G77jFmM_zFtVfroC5hrFRyEMlDqP0eFyUc-bJTia1JKMnKNsJKTiY6FBxKgCtqc1hDFlRBExlUgyHTvzXv0cLDSxTGm90VV"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  )
}
