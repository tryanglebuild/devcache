'use client';

import { useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { DevCacheLogo } from '@/components/ui/DevCacheLogo';
import { useTheme } from '@/components/providers/ThemeProvider';

interface CLIAuthConfirmationProps {
  user: User;
  session: Session | null;
  redirectUri?: string;
}

export function CLIAuthConfirmation({ user, session, redirectUri }: CLIAuthConfirmationProps) {
  const [loading, setLoading] = useState(false);
  const { resolvedTheme } = useTheme();

  // Debug logging
  console.log('CLIAuthConfirmation props:', {
    hasUser: !!user,
    hasSession: !!session,
    redirectUri,
  });

  const handleConfirm = async () => {
    if (!redirectUri) {
      console.error('Missing redirect URI');
      toast.error('Invalid redirect URI');
      return;
    }

    if (!session) {
      console.error('Missing session');
      toast.error('Session expired. Please sign in again.');
      return;
    }

    setLoading(true);

    try {
      console.log('Confirming CLI access with redirect URI:', redirectUri);
      
      toast.success('Access granted! Redirecting...');
      
      // Redirect to success page with all necessary parameters
      const successUrl = new URL('/auth/cli/success', window.location.origin);
      successUrl.searchParams.set('access_token', session.access_token);
      successUrl.searchParams.set('refresh_token', session.refresh_token);
      successUrl.searchParams.set('user_id', user.id);
      successUrl.searchParams.set('email', user.email!);
      successUrl.searchParams.set('expires_at', session.expires_at?.toString() || '0');
      successUrl.searchParams.set('redirect_uri', redirectUri);
      
      window.location.href = successUrl.toString();
    } catch (error: any) {
      console.error('Confirmation error:', error);
      toast.error(error.message || 'Failed to confirm access');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    toast.error('CLI access denied');
    window.close();
  };

  return (
    <>
      {/* Mobile Logo */}
      <div className="lg:hidden p-8 flex justify-between items-center bg-white border-b border-slate-200 dark:bg-surface-container dark:border-white/[0.09]">
        <Link href="/" className="hover:opacity-80 transition-opacity inline-flex">
          <DevCacheLogo size="sm" theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />
        </Link>
      </div>

      <div className="flex-grow flex items-center justify-center p-8 md:p-16 lg:p-24">
        <div className="w-full max-w-md">
          {/* User Info Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8 dark:bg-surface-container dark:shadow-none dark:ring-1 dark:ring-white/[0.08] dark:border-transparent">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#494bd6] to-[#4338ca] rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  person
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-on-surface">Signed in as</h3>
                <p className="text-slate-600 font-medium dark:text-on-surface-variant">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Confirmation Section */}
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2 dark:text-on-surface">Confirm CLI Access</h2>
            <p className="text-slate-500 font-medium dark:text-on-surface-variant">Your CLI is requesting access to your devCache account.</p>
          </div>

          {/* Permissions Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8 dark:bg-surface-container dark:shadow-none dark:ring-1 dark:ring-white/[0.08] dark:border-transparent">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 dark:text-on-surface">
              <span className="material-symbols-outlined text-[#494bd6] dark:text-[#7c7ff5]">security</span>
              Requested Permissions
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5 dark:bg-green-500/15">
                  <span className="material-symbols-outlined text-green-600 text-sm dark:text-green-400">check</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-on-surface">Read your agents and templates</p>
                  <p className="text-sm text-slate-500 dark:text-on-surface-variant">Access your saved agents, templates, and configurations</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5 dark:bg-green-500/15">
                  <span className="material-symbols-outlined text-green-600 text-sm dark:text-green-400">check</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-on-surface">Execute agents</p>
                  <p className="text-sm text-slate-500 dark:text-on-surface-variant">Run agents and workflows from the command line</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5 dark:bg-green-500/15">
                  <span className="material-symbols-outlined text-green-600 text-sm dark:text-green-400">check</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-on-surface">Manage your projects</p>
                  <p className="text-sm text-slate-500 dark:text-on-surface-variant">Create, update, and delete projects and collections</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5 dark:bg-green-500/15">
                  <span className="material-symbols-outlined text-green-600 text-sm dark:text-green-400">check</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-on-surface">Access marketplace</p>
                  <p className="text-sm text-slate-500 dark:text-on-surface-variant">Browse and download agents from the marketplace</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 dark:bg-blue-500/10 dark:border-blue-500/20">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-600 flex-shrink-0 dark:text-blue-400">info</span>
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1 dark:text-blue-300">Security Notice</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You can revoke CLI access at any time from your account settings. Tokens expire automatically after the session ends.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full bg-[#494bd6] hover:bg-[#2f2ebe] text-white font-bold py-4 px-4 rounded-xl shadow-xl shadow-[#494bd6]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-[#7c7ff5] dark:hover:bg-[#9b9df7] dark:text-[#0d1121] dark:shadow-[#7c7ff5]/10"
            >
              <span className="material-symbols-outlined">check_circle</span>
              <span>{loading ? 'Confirming...' : 'Confirm & Grant Access'}</span>
            </button>

            <button
              onClick={handleCancel}
              disabled={loading}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-4 px-4 rounded-xl border-2 border-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-surface-container-high dark:hover:bg-surface-container-highest dark:text-on-surface dark:border-white/[0.09]"
            >
              <span className="material-symbols-outlined">cancel</span>
              <span>Cancel</span>
            </button>
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
    </>
  );
}
