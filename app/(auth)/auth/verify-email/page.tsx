import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Verify Your Email | devCache',
  description: 'Check your email to verify your account.',
}

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-[480px] relative z-10">
      <div className="glass-panel p-8 md:p-10 rounded-xl shadow-2xl border border-outline-variant/15 text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-container rounded-full flex items-center justify-center mx-auto mb-6">
          <span
            className="material-symbols-outlined text-on-primary-fixed text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            mail
          </span>
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-4">
          Check Your Email
        </h1>
        <p className="text-on-surface-variant font-medium mb-8 leading-relaxed">
          We've sent you a verification link. Please check your email and click
          the link to activate your account.
        </p>

        {/* Actions */}
        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-bold py-3.5 px-4 rounded-lg shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Return to Home
          </Link>
          <Link
            href="/login"
            className="block w-full text-primary hover:text-primary-fixed-dim transition-colors font-semibold py-3"
          >
            Go to Sign In
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-8 border-t border-outline-variant/10">
          <p className="text-xs text-on-surface-variant">
            Didn't receive the email? Check your spam folder or{' '}
            <button className="text-primary hover:text-primary-fixed-dim transition-colors font-semibold">
              resend verification email
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
