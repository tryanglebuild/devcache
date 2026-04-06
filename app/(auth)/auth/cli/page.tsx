import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CLIAuthForm } from '@/components/auth/CLIAuthForm';

export default async function CLIAuthPage({
  searchParams,
}: {
  searchParams: { redirect_uri?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If already authenticated, redirect with tokens
  if (user) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session && searchParams.redirect_uri) {
      const redirectUrl = new URL(searchParams.redirect_uri);
      redirectUrl.searchParams.set('access_token', session.access_token);
      redirectUrl.searchParams.set('refresh_token', session.refresh_token);
      redirectUrl.searchParams.set('user_id', user.id);
      redirectUrl.searchParams.set('email', user.email!);
      redirectUrl.searchParams.set('expires_at', session.expires_at?.toString() || '0');
      
      redirect(redirectUrl.toString());
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              DevCache CLI Authentication
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to connect your CLI with DevCache
            </p>
          </div>

          <CLIAuthForm redirectUri={searchParams.redirect_uri} />

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>After signing in, you'll be redirected back to your terminal</p>
          </div>
        </div>
      </div>
    </div>
  );
}
