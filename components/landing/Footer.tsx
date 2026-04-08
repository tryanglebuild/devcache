import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-slate-50 pt-24 pb-12 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-16">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-indigo-400 rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                layers
              </span>
            </div>
            <div className="text-lg font-black text-slate-900 tracking-tighter">devCache</div>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            Agentic AI marketplace for professionals. Create, share, and orchestrate specialized AI agents across design, development, product, QA, and more.
          </p>
          <div className="flex gap-5">
            <span className="material-symbols-outlined text-slate-400 hover:text-indigo-600 cursor-pointer text-xl transition-colors">
              share
            </span>
            <span className="material-symbols-outlined text-slate-400 hover:text-indigo-600 cursor-pointer text-xl transition-colors">
              rss_feed
            </span>
          </div>
        </div>
        
        <div>
          <h4 className="font-extrabold text-slate-900 mb-8 text-[11px] uppercase tracking-[0.2em]">Platform</h4>
          <ul className="space-y-4">
            <li><Link href="#" className="text-slate-500 text-sm font-medium hover:text-indigo-600 transition-colors">Agents</Link></li>
            <li><Link href="#" className="text-slate-500 text-sm font-medium hover:text-indigo-600 transition-colors">Marketplace</Link></li>
            <li><Link href="#" className="text-slate-500 text-sm font-medium hover:text-indigo-600 transition-colors">Orchestration</Link></li>
            <li><Link href="#" className="text-slate-500 text-sm font-medium hover:text-indigo-600 transition-colors">Changelog</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-extrabold text-slate-900 mb-8 text-[11px] uppercase tracking-[0.2em]">Resources</h4>
          <ul className="space-y-4">
            <li><Link href="#" className="text-slate-500 text-sm font-medium hover:text-indigo-600 transition-colors">Documentation</Link></li>
            <li><Link href="#" className="text-slate-500 text-sm font-medium hover:text-indigo-600 transition-colors">Status</Link></li>
            <li><Link href="#" className="text-slate-500 text-sm font-medium hover:text-indigo-600 transition-colors">Security</Link></li>
            <li><Link href="#" className="text-slate-500 text-sm font-medium hover:text-indigo-600 transition-colors">Contact</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-extrabold text-slate-900 mb-8 text-[11px] uppercase tracking-[0.2em]">Legal</h4>
          <ul className="space-y-4">
            <li><Link href="#" className="text-slate-500 text-sm font-medium hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="text-slate-500 text-sm font-medium hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-8 mt-24 pt-12 border-t border-slate-200 text-center">
        <p className="text-slate-400 text-xs font-semibold tracking-wide">
          © {new Date().getFullYear()} devCache. Build with AI Agents That Know Your Domain.
        </p>
      </div>
    </footer>
  )
}
