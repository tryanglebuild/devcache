'use client'

import Link from 'next/link'

export default function Navigation() {
  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-xl" style={{ background: 'rgba(11, 19, 38, 0.7)' }}>
      <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
        <Link href="/" className="text-xl font-bold tracking-tighter text-slate-50 flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-400" style={{ fontVariationSettings: "'FILL' 1" }}>
            terminal
          </span>
          devCache
        </Link>
        
        <div className="hidden md:flex gap-8 items-center font-['Inter'] antialiased tracking-tight text-sm font-medium">
          <Link href="#features" className="nav-link">Features</Link>
          <Link href="#problem" className="nav-link">Problem</Link>
          <Link href="#solution" className="nav-link">Solution</Link>
          <Link href="#pricing" className="nav-link">Pricing</Link>
        </div>
        
        <button className="btn-primary active:scale-95 transition-transform">
          Get Started
        </button>
      </div>
    </nav>
  )
}
