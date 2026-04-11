'use client'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import OAuthButton from '@/components/auth/OAuthButton'
import { DevCacheLogo } from '@/components/ui/DevCacheLogo'
import { useTheme } from '@/components/providers/ThemeProvider'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { resolvedTheme } = useTheme()
  const redirectTo = searchParams.get('redirectTo') || undefined

  // Check for error messages from OAuth callback
  useEffect(() => {
    const error = searchParams.get('error')
    const message = searchParams.get('message')
    
    if (error === 'account_exists' && message) {
      toast.error(message, { duration: 5000 })
    } else if (error) {
      toast.error(decodeURIComponent(error))
    }
  }, [searchParams])

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
        const redirectTo = searchParams.get('redirectTo')
        router.push(redirectTo || '/dashboard')
        router.refresh()
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
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
          <Link href="/" className="mb-20 hover:opacity-80 transition-opacity inline-flex">
            <DevCacheLogo size="lg" theme="dark" />
          </Link>

          {/* Content */}
          <div className="max-w-xl">
            <h1 className="text-5xl font-black tracking-tight leading-tight mb-6">
              Welcome Back to Your Agent Workspace.{' '}
              <span className="bg-gradient-to-r from-[#c0c1ff] to-[#8083ff] bg-clip-text text-transparent">
                executable.
              </span>
            </h1>
            <p className="text-xl text-primary/70 font-medium mb-12">
              Sign in to access your AI agents, orchestration workflows, and marketplace downloads.
            </p>

            {/* Benefits */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">smart_toy</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Your Specialized Agents</h3>
                  <p className="text-primary/60 text-sm">Access your custom agents and downloaded marketplace agents instantly.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">psychology</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Orchestration Workflows</h3>
                  <p className="text-primary/60 text-sm">Continue your multi-agent workflows and collaborative projects.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">store</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Marketplace Access</h3>
                  <p className="text-primary/60 text-sm">Browse and download agents from experts across all disciplines.</p>
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
      <main className="w-full lg:w-1/2 flex flex-col bg-slate-50 dark:bg-surface-container-low relative">
        {/* Mobile Logo */}
        <div className="lg:hidden p-8 flex justify-between items-center bg-white border-b border-slate-200 dark:bg-surface-container dark:border-white/[0.09]">
          <Link href="/" className="hover:opacity-80 transition-opacity inline-flex">
            <DevCacheLogo size="sm" theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />
          </Link>
          <Link href="/docs" className="text-sm font-semibold text-[#494bd6] dark:text-[#7c7ff5]">
            Docs
          </Link>
        </div>

        <div className="flex-grow flex items-center justify-center p-8 md:p-16 lg:p-24">
          <div className="w-full max-w-md">
            <div className="mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2 dark:text-on-surface">Sign In</h2>
              <p className="text-slate-500 font-medium dark:text-on-surface-variant">Welcome back to your agent workspace.</p>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3">
              <OAuthButton provider="github" mode="login" redirectTo={redirectTo} />
              <OAuthButton provider="google" mode="login" redirectTo={redirectTo} />
            </div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-white/[0.09]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="px-4 bg-slate-50 text-slate-400 font-bold dark:bg-surface-container-low dark:text-on-surface-variant">Or use email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1 dark:text-on-surface-variant">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dev@example.com"
                  className="w-full bg-white border-slate-200 focus:border-[#494bd6] focus:ring-4 focus:ring-[#494bd6]/10 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-300 transition-all dark:bg-surface-container dark:border-white/[0.09] dark:focus:border-[#7c7ff5] dark:focus:ring-[#7c7ff5]/10 dark:text-on-surface dark:placeholder-on-surface-variant/50"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label htmlFor="password" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-on-surface-variant">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-[11px] font-bold text-[#494bd6] hover:underline dark:text-[#7c7ff5]">
                    Forgot Password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border-slate-200 focus:border-[#494bd6] focus:ring-4 focus:ring-[#494bd6]/10 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-300 transition-all dark:bg-surface-container dark:border-white/[0.09] dark:focus:border-[#7c7ff5] dark:focus:ring-[#7c7ff5]/10 dark:text-on-surface dark:placeholder-on-surface-variant/50"
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#494bd6] hover:bg-[#2f2ebe] text-white font-bold py-4 px-4 rounded-xl shadow-xl shadow-[#494bd6]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-[#7c7ff5] dark:hover:bg-[#9b9df7] dark:text-[#0d1121] dark:shadow-[#7c7ff5]/10"
                >
                  <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
                  <span className="material-symbols-outlined text-xl">arrow_right_alt</span>
                </button>
              </div>
            </form>

            <div className="mt-10 text-center">
              <p className="text-sm text-slate-500 font-medium dark:text-on-surface-variant">
                New to devCache?{' '}
                <Link href="/signup" className="text-[#494bd6] hover:underline transition-colors ml-1 font-bold dark:text-[#7c7ff5]">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-8 border-t border-slate-200 bg-white dark:border-white/[0.09] dark:bg-surface-container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest dark:text-on-surface-variant">
            <div>© 2024 DEVHUB. ALL RIGHTS RESERVED.</div>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-[#494bd6] dark:hover:text-[#7c7ff5]">Privacy</Link>
              <Link href="/terms" className="hover:text-[#494bd6] dark:hover:text-[#7c7ff5]">Terms</Link>
              <Link href="/support" className="hover:text-[#494bd6] dark:hover:text-[#7c7ff5]">Support</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center dark:bg-surface-container-low dark:text-on-surface-variant">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
