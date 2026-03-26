import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sign In | devCache',
  description: 'Sign in to your devCache account.',
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-[480px] relative z-10">
      <div className="glass-panel p-8 md:p-10 rounded-xl shadow-2xl border border-outline-variant/15 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-4">
          Sign In
        </h1>
        <p className="text-on-surface-variant font-medium mb-8">
          Login page coming soon...
        </p>
        <Link
          href="/signup"
          className="text-primary hover:text-primary-fixed-dim transition-colors font-semibold"
        >
          Create an account instead
        </Link>
      </div>
    </div>
  )
}
