'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { UserIdentity } from '@supabase/supabase-js'

export default function LinkedAccountsManager() {
  const [identities, setIdentities] = useState<UserIdentity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLinking, setIsLinking] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadIdentities()
  }, [])

  const loadIdentities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsLoading(false)
        return
      }

      // Get user identities
      const userIdentities = user.identities || []
      setIdentities(userIdentities)
    } catch (error) {
      console.error('Error loading identities:', error)
      toast.error('Failed to load linked accounts')
    } finally {
      setIsLoading(false)
    }
  }

  const linkProvider = async (provider: 'google' | 'github') => {
    setIsLinking(provider)
    
    try {
      const { error } = await supabase.auth.linkIdentity({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`,
        },
      })

      if (error) {
        // Handle specific error cases
        if (error.message.includes('Manual linking is disabled')) {
          toast.error(
            'Manual linking is disabled. Please enable it in Supabase Dashboard under Authentication → Providers.',
            { duration: 6000 }
          )
        } else if (error.message.includes('identity_already_exists') || error.message.includes('already linked')) {
          toast.error(
            `This ${provider} account is already linked to another user. Please use a different ${provider} account or contact support.`,
            { duration: 6000 }
          )
        } else {
          toast.error(`Failed to link ${provider}: ${error.message}`)
        }
      }
    } catch (error) {
      console.error('Error linking provider:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLinking(null)
    }
  }

  const unlinkProvider = async (identityId: string, provider: string) => {
    if (identities.length <= 1) {
      toast.error('You must keep at least one login method')
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to unlink your ${provider} account? You will no longer be able to sign in with ${provider}.`
    )

    if (!confirmed) return

    try {
      const { error } = await supabase.auth.unlinkIdentity(
        identities.find(i => i.id === identityId)!
      )

      if (error) {
        toast.error(`Failed to unlink ${provider}: ${error.message}`)
        return
      }

      toast.success(`${provider} account unlinked successfully`)
      loadIdentities()
    } catch (error) {
      console.error('Error unlinking provider:', error)
      toast.error('An unexpected error occurred')
    }
  }

  const getProviderIcon = (provider: string) => {
    if (provider === 'github') {
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
      )
    }
    
    if (provider === 'google') {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      )
    }

    if (provider === 'email') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    }

    return null
  }

  const getProviderName = (provider: string) => {
    const names: Record<string, string> = {
      github: 'GitHub',
      google: 'Google',
      email: 'Email/Password',
    }
    return names[provider] || provider
  }

  const hasProvider = (provider: string) => {
    return identities.some(identity => identity.provider === provider)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-2">Linked Accounts</h3>
      <p className="text-sm text-slate-500 mb-6">
        Manage your login methods. You can link multiple accounts to sign in with different providers.
      </p>

      {/* Current Linked Accounts */}
      <div className="space-y-3 mb-6">
        {identities.map((identity) => (
          <div
            key={identity.id}
            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
          >
            <div className="flex items-center gap-3">
              <div className="text-slate-700">
                {getProviderIcon(identity.provider)}
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {getProviderName(identity.provider)}
                </p>
                <p className="text-xs text-slate-500">
                  {identity.identity_data?.email || 'No email'}
                </p>
              </div>
            </div>
            
            {identities.length > 1 && (
              <button
                onClick={() => unlinkProvider(identity.id, identity.provider)}
                className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
              >
                Unlink
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Available Providers to Link */}
      <div className="border-t border-slate-200 pt-6">
        <h4 className="text-sm font-bold text-slate-700 mb-3">Add Login Method</h4>
        <div className="space-y-2">
          {!hasProvider('github') && (
            <button
              onClick={() => linkProvider('github')}
              disabled={isLinking === 'github'}
              className="w-full flex items-center justify-between p-3 bg-slate-900 hover:bg-black text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                {getProviderIcon('github')}
                <span className="font-semibold">Link GitHub</span>
              </div>
              {isLinking === 'github' && (
                <span className="text-xs">Connecting...</span>
              )}
            </button>
          )}

          {!hasProvider('google') && (
            <button
              onClick={() => linkProvider('google')}
              disabled={isLinking === 'google'}
              className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                {getProviderIcon('google')}
                <span className="font-semibold">Link Google</span>
              </div>
              {isLinking === 'google' && (
                <span className="text-xs">Connecting...</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
