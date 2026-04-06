import { createClient } from '@/lib/supabase/server';
import { CLIAuthForm } from '@/components/auth/CLIAuthForm';
import { CLIAuthConfirmation } from '@/components/auth/CLIAuthConfirmation';
import Link from 'next/link';

export default async function CLIAuthPage({
  searchParams,
}: {
  searchParams: { redirect_uri?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If already authenticated, show confirmation screen
  if (user) {
    const { data: { session } } = await supabase.auth.getSession();
    
    return (
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
                CLI Access Request.{' '}
                <span className="bg-gradient-to-r from-[#c0c1ff] to-[#8083ff] bg-clip-text text-transparent">
                  Secure.
                </span>
              </h1>
              <p className="text-xl text-primary/70 font-medium mb-12">
                Your CLI is requesting access to your devCache account. Review the permissions and confirm to continue.
              </p>

              {/* Security Features */}
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary">verified_user</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Secure Authentication</h3>
                    <p className="text-primary/60 text-sm">Your credentials are encrypted and never stored by the CLI.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary">key</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Token-Based Access</h3>
                    <p className="text-primary/60 text-sm">Temporary tokens are used for secure API communication.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary">shield</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Revocable Anytime</h3>
                    <p className="text-primary/60 text-sm">You can revoke CLI access from your account settings at any time.</p>
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

        {/* Right Side - Confirmation */}
        <main className="w-full lg:w-1/2 flex flex-col bg-slate-50">
          <CLIAuthConfirmation 
            user={user} 
            session={session} 
            redirectUri={searchParams.redirect_uri} 
          />
        </main>
      </div>
    );
  }

  // Not authenticated - show login form
  return (
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
              Connect Your CLI.{' '}
              <span className="bg-gradient-to-r from-[#c0c1ff] to-[#8083ff] bg-clip-text text-transparent">
                Seamlessly.
              </span>
            </h1>
            <p className="text-xl text-primary/70 font-medium mb-12">
              Sign in to authenticate your CLI and access your agents, templates, and workflows directly from your terminal.
            </p>

            {/* Benefits */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">terminal</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Command Line Power</h3>
                  <p className="text-primary/60 text-sm">Execute agents and manage templates directly from your terminal.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">sync</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Real-time Sync</h3>
                  <p className="text-primary/60 text-sm">Your CLI stays in sync with your web dashboard automatically.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">speed</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Lightning Fast</h3>
                  <p className="text-primary/60 text-sm">Execute workflows faster than ever with CLI efficiency.</p>
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
        </div>

        <div className="flex-grow flex items-center justify-center p-8 md:p-16 lg:p-24">
          <div className="w-full max-w-md">
            <div className="mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">CLI Authentication</h2>
              <p className="text-slate-500 font-medium">Sign in to connect your terminal with devCache.</p>
            </div>

            <CLIAuthForm redirectUri={searchParams.redirect_uri} />
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
  );
}
