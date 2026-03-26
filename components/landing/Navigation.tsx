'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-0 w-full z-50 flex justify-center">
      <nav 
        className={`glass-nav-dark transition-all duration-500 ease-out ${
          isScrolled 
            ? 'mt-4 rounded-full max-w-fit' 
            : 'w-full rounded-none'
        }`}
      >
        <div 
          className={`flex items-center justify-between px-8 transition-all duration-500 ${
            isScrolled ? 'py-2 gap-6' : 'py-4 gap-8 max-w-7xl mx-auto'
          }`}
        >
          <Link 
            href="/" 
            className={`font-bold tracking-tighter text-slate-50 flex items-center gap-2 transition-all duration-500 ${
              isScrolled ? 'text-base' : 'text-xl'
            }`}
          >
            <span 
              className={`material-symbols-outlined text-indigo-400 transition-all duration-500 ${
                isScrolled ? 'text-lg' : 'text-2xl'
              }`} 
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              terminal
            </span>
            <span className={isScrolled ? 'hidden md:inline' : ''}>devCache</span>
          </Link>
          
          <div 
            className={`hidden md:flex items-center font-['Inter'] antialiased tracking-tight font-medium transition-all duration-500 ${
              isScrolled ? 'text-xs gap-4' : 'text-sm gap-8'
            }`}
          >
            <Link href="#features" className="nav-link">Features</Link>
            <Link href="#problem" className="nav-link">Problem</Link>
            <Link href="#solution" className="nav-link">Solution</Link>
            <Link href="#pricing" className="nav-link">Pricing</Link>
          </div>
          
          <Link 
            href="/signup"
            className={`btn-primary active:scale-95 transition-all duration-500 whitespace-nowrap ${
              isScrolled ? 'text-xs py-2 px-4' : 'text-sm py-3 px-6'
            }`}
          >
            Get Started
          </Link>
        </div>
      </nav>
    </div>
  )
}
