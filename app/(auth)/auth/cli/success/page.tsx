import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CLISuccessHandler } from '@/components/auth/CLISuccessHandler';

export default async function CLISuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    access_token?: string;
    refresh_token?: string;
    user_id?: string;
    email?: string;
    expires_at?: string;
    redirect_uri?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If not authenticated, redirect to login
  if (!user) {
    redirect('/login');
  }

  return (
    <>
      <CLISuccessHandler />
      <div className="min-h-screen flex bg-slate-50">
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
      <main className="w-full lg:w-1/2 flex flex-col bg-slate-50">
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
            {/* Success Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                Authentication Successful!
              </h2>
              <p className="text-slate-600 font-medium text-lg mb-2">
                Your CLI has been authorized
              </p>
              <p className="text-slate-500 text-sm">
                Logged in as: <span className="font-semibold text-slate-700">{user.email}</span>
              </p>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-blue-600 flex-shrink-0 mt-0.5">info</span>
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-2">Next Steps</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Return to your terminal to continue</li>
                    <li>• Your session has been stored locally</li>
                    <li>• You can now use all CLI commands</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Link
                href="/dashboard"
                className="w-full bg-[#494bd6] hover:bg-[#2f2ebe] text-white font-bold py-4 px-4 rounded-xl shadow-xl shadow-[#494bd6]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">dashboard</span>
                <span>Go to Dashboard</span>
              </Link>

              <button
                onClick={() => window.close()}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-4 px-4 rounded-xl border-2 border-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">close</span>
                <span>Close Window</span>
              </button>
            </div>

            {/* Terminal Hint */}
            <div className="mt-8 text-center">
              <p className="text-xs text-slate-400 font-medium">
                You can safely close this window and return to your terminal
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
    </>
  );
}
