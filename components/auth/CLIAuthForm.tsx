'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface CLIAuthFormProps {
  redirectUri?: string;
}

export function CLIAuthForm({ redirectUri }: CLIAuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!redirectUri) {
      toast.error('Invalid redirect URI');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.session || !data.user) {
        throw new Error('No session data returned');
      }

      toast.success('Authentication successful! Redirecting...');
      
      // Redirect to success page with all necessary parameters
      const successUrl = new URL('/auth/cli/success', window.location.origin);
      successUrl.searchParams.set('access_token', data.session.access_token);
      successUrl.searchParams.set('refresh_token', data.session.refresh_token);
      successUrl.searchParams.set('user_id', data.user.id);
      successUrl.searchParams.set('email', data.user.email!);
      successUrl.searchParams.set('expires_at', data.session.expires_at?.toString() || '0');
      successUrl.searchParams.set('redirect_uri', redirectUri);
      
      // Redirect to success page
      window.location.href = successUrl.toString();
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(error.message || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
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
          className="w-full bg-white border border-slate-200 focus:border-[#494bd6] focus:ring-4 focus:ring-[#494bd6]/10 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-300 transition-all dark:bg-surface-container dark:border-white/[0.09] dark:focus:border-[#7c7ff5] dark:focus:ring-[#7c7ff5]/10 dark:text-on-surface dark:placeholder-on-surface-variant/50"
          required
          disabled={loading}
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1 dark:text-on-surface-variant">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-white border border-slate-200 focus:border-[#494bd6] focus:ring-4 focus:ring-[#494bd6]/10 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-300 transition-all dark:bg-surface-container dark:border-white/[0.09] dark:focus:border-[#7c7ff5] dark:focus:ring-[#7c7ff5]/10 dark:text-on-surface dark:placeholder-on-surface-variant/50"
          required
          disabled={loading}
        />
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#494bd6] hover:bg-[#2f2ebe] text-white font-bold py-4 px-4 rounded-xl shadow-xl shadow-[#494bd6]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-[#7c7ff5] dark:hover:bg-[#9b9df7] dark:text-[#0d1121] dark:shadow-[#7c7ff5]/10"
        >
          <span>{loading ? 'Authenticating...' : 'Authenticate CLI'}</span>
          <span className="material-symbols-outlined text-xl">arrow_right_alt</span>
        </button>
      </div>

      <div className="mt-10 text-center">
        <p className="text-sm text-slate-500 font-medium dark:text-on-surface-variant">
          Don't have an account?{' '}
          <Link href="/signup" className="text-[#494bd6] hover:underline transition-colors ml-1 font-bold dark:text-[#7c7ff5]">
            Create one
          </Link>
        </p>
      </div>
    </form>
  );
}
