'use client';

import Link from 'next/link';
import { DevCacheLogo } from '@/components/ui/DevCacheLogo';
import { useTheme } from '@/components/providers/ThemeProvider';

interface CLISuccessContentProps {
  userEmail: string;
}

export function CLISuccessContent({ userEmail }: CLISuccessContentProps) {
  const { resolvedTheme } = useTheme();
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-surface-container-low">
      {/* Left Side - Brand */}
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
              You're All Set!{' '}
              <span className="bg-gradient-to-r from-[#c0c1ff] to-[#8083ff] bg-clip-text text-transparent">
                Connected.
              </span>
            </h1>
            <p className="text-xl text-primary/70 font-medium mb-12">
              Your CLI has been successfully authenticated and is now connected to your devCache account.
            </p>

            {/* Success Features */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-green-400">check_circle</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Authentication Complete</h3>
                  <p className="text-primary/60 text-sm">Your terminal is now connected to your account.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-green-400">terminal</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">CLI Ready</h3>
                  <p className="text-primary/60 text-sm">Return to your terminal to start using devCache CLI.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-green-400">dashboard</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Dashboard Access</h3>
                  <p className="text-primary/60 text-sm">Continue to your dashboard to manage agents and templates.</p>
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

      {/* Right Side - Success Message */}
      <main className="w-full lg:w-1/2 flex flex-col bg-slate-50 dark:bg-surface-container-low">
        {/* Mobile Logo */}
        <div className="lg:hidden p-8 flex justify-between items-center bg-white border-b border-slate-200 dark:bg-surface-container dark:border-white/[0.09]">
          <Link href="/" className="hover:opacity-80 transition-opacity inline-flex">
            <DevCacheLogo size="sm" theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />
          </Link>
        </div>

        <div className="flex-grow flex items-center justify-center p-8 md:p-16 lg:p-24">
          <div className="w-full max-w-md">
            {/* Success Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-500/15">
                <span className="material-symbols-outlined text-green-600 text-5xl dark:text-green-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3 dark:text-on-surface">
                Authentication Successful!
              </h2>
              <p className="text-slate-600 font-medium text-lg mb-2 dark:text-on-surface-variant">
                Your CLI has been authorized
              </p>
              <p className="text-slate-500 text-sm dark:text-on-surface-variant">
                Logged in as: <span className="font-semibold text-slate-700 dark:text-on-surface">{userEmail}</span>
              </p>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 dark:bg-blue-500/10 dark:border-blue-500/20">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-blue-600 flex-shrink-0 mt-0.5 dark:text-blue-400">info</span>
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-2 dark:text-blue-300">Completing Authentication</p>
                  <ul className="text-sm text-blue-700 space-y-1 dark:text-blue-300">
                    <li>• Sending credentials to your terminal...</li>
                    <li>• You will be redirected automatically</li>
                    <li>• Your session has been stored locally</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Link
                href="/dashboard"
                className="w-full bg-[#494bd6] hover:bg-[#2f2ebe] text-white font-bold py-4 px-4 rounded-xl shadow-xl shadow-[#494bd6]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 dark:bg-[#7c7ff5] dark:hover:bg-[#9b9df7] dark:text-[#0d1121] dark:shadow-[#7c7ff5]/10"
              >
                <span className="material-symbols-outlined">dashboard</span>
                <span>Go to Dashboard</span>
              </Link>

              <button
                onClick={() => window.close()}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-4 px-4 rounded-xl border-2 border-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 dark:bg-surface-container-high dark:hover:bg-surface-container-highest dark:text-on-surface dark:border-white/[0.09]"
              >
                <span className="material-symbols-outlined">close</span>
                <span>Close Window</span>
              </button>
            </div>

            {/* Terminal Hint */}
            <div className="mt-8 text-center">
              <p className="text-xs text-slate-400 font-medium dark:text-on-surface-variant">
                You can safely close this window and return to your terminal
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
  );
}
