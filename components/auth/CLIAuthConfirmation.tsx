'use client';

import { useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface CLIAuthConfirmationProps {
  user: User;
  session: Session | null;
  redirectUri?: string;
}

export function CLIAuthConfirmation({ user, session, redirectUri }: CLIAuthConfirmationProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!redirectUri || !session) {
      toast.error('Invalid redirect URI or session');
      return;
    }

    setLoading(true);

    try {
      // Redirect back to CLI with tokens
      const redirectUrl = new URL(redirectUri);
      redirectUrl.searchParams.set('access_token', session.access_token);
      redirectUrl.searchParams.set('refresh_token', session.refresh_token);
      redirectUrl.searchParams.set('user_id', user.id);
      redirectUrl.searchParams.set('email', user.email!);
      redirectUrl.searchParams.set('expires_at', session.expires_at?.toString() || '0');

      toast.success('Access granted! Redirecting to CLI...');
      
      // Redirect
      window.location.href = redirectUrl.toString();
    } catch (error: any) {
      console.error('Confirmation error:', error);
      toast.error('Failed to confirm access');
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
      <div className="lg:hidden p-8 flex justify-between items-center bg-white border-b border-slate-200">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-[#494bd6] rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              terminal
            </span>
          </div>
          <span className="text-xl font-bold tracking-tighter text-slate-900">devCache</span>
        </Link>
      </div>

      <div className="flex-grow flex items-center justify-center p-8 md:p-16 lg:p-24">
        <div className="w-full max-w-md">
          {/* User Info Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#494bd6] to-[#6063ee] rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  person
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Signed in as</h3>
                <p className="text-slate-600 font-medium">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Confirmation Section */}
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Confirm CLI Access</h2>
            <p className="text-slate-500 font-medium">Your CLI is requesting access to your devCache account.</p>
          </div>

          {/* Permissions Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#494bd6]">security</span>
              Requested Permissions
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-green-600 text-sm">check</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Read your agents and templates</p>
                  <p className="text-sm text-slate-500">Access your saved agents, templates, and configurations</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-green-600 text-sm">check</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Execute agents</p>
                  <p className="text-sm text-slate-500">Run agents and workflows from the command line</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-green-600 text-sm">check</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Manage your projects</p>
                  <p className="text-sm text-slate-500">Create, update, and delete projects and collections</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-green-600 text-sm">check</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Access marketplace</p>
                  <p className="text-sm text-slate-500">Browse and download agents from the marketplace</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-600 flex-shrink-0">info</span>
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Security Notice</p>
                <p className="text-sm text-blue-700">
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
              className="w-full bg-[#494bd6] hover:bg-[#2f2ebe] text-white font-bold py-4 px-4 rounded-xl shadow-xl shadow-[#494bd6]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">check_circle</span>
              <span>{loading ? 'Confirming...' : 'Confirm & Grant Access'}</span>
            </button>

            <button
              onClick={handleCancel}
              disabled={loading}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-4 px-4 rounded-xl border-2 border-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">cancel</span>
              <span>Cancel</span>
            </button>
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
    </>
  );
}
