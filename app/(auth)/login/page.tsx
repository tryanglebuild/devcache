'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      if (data.user) {
        toast.success('Welcome back!')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGitHubLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast.error(error.message)
      }
    } catch (error) {
      toast.error('Failed to sign in with GitHub')
      console.error('GitHub OAuth error:', error)
    }
  }

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
              Welcome Back to Your Knowledge Vault.{' '}
              <span className="bg-gradient-to-r from-[#c0c1ff] to-[#8083ff] bg-clip-text text-transparent">
                centralized.
              </span>
            </h1>
            <p className="text-xl text-primary/70 font-medium mb-12">
              Sign in to access your saved templates, project blueprints, and technical documentation.
            </p>

            {/* Benefits */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">lock_open</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Instant Context Retrieval</h3>
                  <p className="text-primary/60 text-sm">Pick up exactly where you left off with your project-specific knowledge bases.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Secure Access</h3>
                  <p className="text-primary/60 text-sm">Your proprietary patterns and configurations are protected and ready for reuse.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">speed</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Developer-First Experience</h3>
                  <p className="text-primary/60 text-sm">Designed for speed, so you can spend less time searching and more time building.</p>
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
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Sign In</h2>
              <p className="text-slate-500 font-medium">Welcome back to your developer workspace.</p>
            </div>

            {/* GitHub OAuth */}
            <button
              onClick={handleGitHubLogin}
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-black text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-slate-200 active:scale-[0.98]"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              <span>Continue with GitHub</span>
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="px-4 bg-slate-50 text-slate-400 font-bold">Or use email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dev@example.com"
                  className="w-full bg-white border-slate-200 focus:border-[#494bd6] focus:ring-4 focus:ring-[#494bd6]/10 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-300 transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label htmlFor="password" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-[11px] font-bold text-[#494bd6] hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border-slate-200 focus:border-[#494bd6] focus:ring-4 focus:ring-[#494bd6]/10 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-300 transition-all"
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#494bd6] hover:bg-[#2f2ebe] text-white font-bold py-4 px-4 rounded-xl shadow-xl shadow-[#494bd6]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
                  <span className="material-symbols-outlined text-xl">arrow_right_alt</span>
                </button>
              </div>
            </form>

            <div className="mt-10 text-center">
              <p className="text-sm text-slate-500 font-medium">
                New to devCache?{' '}
                <Link href="/signup" className="text-[#494bd6] hover:underline transition-colors ml-1 font-bold">
                  Create an account
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
