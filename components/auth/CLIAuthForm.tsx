'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

      // Redirect back to CLI with tokens
      const redirectUrl = new URL(redirectUri);
      redirectUrl.searchParams.set('access_token', data.session.access_token);
      redirectUrl.searchParams.set('refresh_token', data.session.refresh_token);
      redirectUrl.searchParams.set('user_id', data.user.id);
      redirectUrl.searchParams.set('email', data.user.email!);
      redirectUrl.searchParams.set('expires_at', data.session.expires_at?.toString() || '0');

      // Redirect
      window.location.href = redirectUrl.toString();
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(error.message || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={loading}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          disabled={loading}
          className="mt-1"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign in to DevCache'}
      </Button>

      <div className="text-center text-sm">
        <a
          href="/signup"
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Don't have an account? Sign up
        </a>
      </div>
    </form>
  );
}
