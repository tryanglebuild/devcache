import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900/50">
      <div className="flex flex-col md:flex-row justify-between items-center px-12 py-20 w-full max-w-7xl mx-auto">
        <div className="mb-12 md:mb-0">
          <Link href="/" className="text-lg font-black text-slate-200 tracking-tighter flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-indigo-400">terminal</span>
            devCache
          </Link>
          <p className="text-slate-500 max-w-xs font-['Inter'] text-xs tracking-wide uppercase font-semibold">
            © 2024 devCache Engineering. Built for velocity.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-12">
          <div className="flex flex-col gap-4">
            <h6 className="text-slate-500 font-bold text-xs uppercase tracking-widest">Product</h6>
            <Link href="#" className="text-slate-500 hover:text-slate-200 transition-colors font-medium text-sm">
              Documentation
            </Link>
            <Link href="#" className="text-slate-500 hover:text-slate-200 transition-colors font-medium text-sm">
              Changelog
            </Link>
            <Link href="#" className="text-slate-500 hover:text-slate-200 transition-colors font-medium text-sm">
              Status
            </Link>
          </div>
          
          <div className="flex flex-col gap-4">
            <h6 className="text-slate-500 font-bold text-xs uppercase tracking-widest">Legal</h6>
            <Link href="#" className="text-slate-500 hover:text-slate-200 transition-colors font-medium text-sm">
              Privacy
            </Link>
            <Link href="#" className="text-slate-500 hover:text-slate-200 transition-colors font-medium text-sm">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
