import type { Metadata } from 'next'
import Link from 'next/link'
import SignupForm from '@/components/auth/SignupForm'
import OAuthButton from '@/components/auth/OAuthButton'

export const metadata: Metadata = {
  title: 'Create New Account | devCache',
  description: 'Join the engineering knowledge hub. Create your devCache account.',
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand & Benefits */}
      <aside className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#494bd6] to-[#131b2e] relative overflow-hidden flex-col justify-between p-16 text-white">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: 'radial-gradient(rgba(192, 193, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-[480px] h-[480px] bg-primary/5 rounded-full blur-[120px]" />
        
        <div className="relative z-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-20 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-primary/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-primary/30">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                terminal
              </span>
            </div>
            <span className="text-2xl font-bold tracking-tighter">devCache</span>
          </Link>

          {/* Content */}
          <div className="max-w-xl">
            <h1 className="text-5xl font-black tracking-tight leading-tight mb-6">
              Build with AI Agents That Know Your Domain, <span className="bg-gradient-to-r from-[#c0c1ff] to-[#8083ff] bg-clip-text text-transparent">executable.</span>
            </h1>
            <p className="text-xl text-primary/70 font-medium mb-12">
              Create, share, and orchestrate specialized AI agents across design, development, product, QA, and more.
            </p>

            {/* Benefits */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">smart_toy</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Create Specialized Agents</h3>
                  <p className="text-primary/60 text-sm">Transform your expertise into executable AI agents for any professional domain.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">store</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Access Agent Marketplace</h3>
                  <p className="text-primary/60 text-sm">Download and customize agents created by experts across all disciplines.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">psychology</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Orchestrate Workflows</h3>
                  <p className="text-primary/60 text-sm">Coordinate multiple agents to solve complex cross-functional problems.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 flex gap-8">
          <div className="flex items-center gap-2 text-primary/50 text-xs font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">verified</span> SOC2 COMPLIANT
          </div>
          <div className="flex items-center gap-2 text-primary/50 text-xs font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">encrypted</span> AES-256 BIT
          </div>
        </div>
      </aside>

      {/* Right Side - Form */}
      <main className="w-full lg:w-1/2 flex flex-col bg-slate-50 relative">
        {/* Mobile Logo */}
        <div className="lg:hidden p-8 flex justify-between items-center bg-white border-b border-slate-200">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-[#494bd6] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                terminal
              </span>
            </div>
            <span className="text-xl font-bold tracking-tighter text-slate-900">devCache</span>
          </Link>
          <Link href="/docs" className="text-sm font-semibold text-[#494bd6]">
            Docs
          </Link>
        </div>

        <div className="flex-grow flex items-center justify-center p-8 md:p-16 lg:p-24">
          <div className="w-full max-w-md">
            <div className="mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Create Account</h2>
              <p className="text-slate-500 font-medium">Start building with AI agents today.</p>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3">
              <OAuthButton provider="github" mode="signup" />
              <OAuthButton provider="google" mode="signup" />
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="px-4 bg-slate-50 text-slate-400 font-bold">Or use email</span>
              </div>
            </div>

            {/* Signup Form */}
            <SignupForm />

            <div className="mt-10 text-center">
              <p className="text-sm text-slate-500 font-medium">
                Already part of devCache?{' '}
                <Link href="/login" className="text-[#494bd6] hover:underline transition-colors ml-1 font-bold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-8 border-t border-slate-200 bg-white">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <div>© 2024 DEVHUB. ALL RIGHTS RESERVED.</div>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-[#494bd6]">Privacy</Link>
              <Link href="/terms" className="hover:text-[#494bd6]">Terms</Link>
              <Link href="/support" className="hover:text-[#494bd6]">Support</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
