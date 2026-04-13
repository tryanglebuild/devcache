import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')
  const redirectUri = requestUrl.searchParams.get('redirect_uri')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const errorCode = requestUrl.searchParams.get('error_code')
  const origin = requestUrl.origin

  // Handle OAuth errors from Supabase
  if (error) {
    console.error('OAuth error:', { error, errorCode, errorDescription })
    
    // Handle specific error cases
    if (errorCode === 'identity_already_exists' || error === 'identity_already_exists') {
      const message = 'This account is already linked to another user. Please use a different account.'
      return NextResponse.redirect(
        `${origin}${next || '/dashboard/settings'}?error=identity_exists&message=${encodeURIComponent(message)}`
      )
    }
    
    if (error === 'server_error' && errorDescription?.includes('Manual linking is disabled')) {
      const message = 'Manual linking is disabled. Please enable it in your authentication settings.'
      return NextResponse.redirect(
        `${origin}${next || '/dashboard/settings'}?error=linking_disabled&message=${encodeURIComponent(message)}`
      )
    }
    
    // Generic error handling
    const message = errorDescription || error
    return NextResponse.redirect(
      `${origin}${next || '/login'}?error=${encodeURIComponent(error)}&message=${encodeURIComponent(message)}`
    )
  }

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      
      // Check if error is due to email already registered with different provider
      if (error.message.includes('already registered') || error.message.includes('email exists')) {
        return NextResponse.redirect(
          `${origin}/login?error=account_exists&message=${encodeURIComponent('This email is already registered. Please sign in with your original method.')}`
        )
      }
      
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }

    if (data.user) {
      // Log successful OAuth login with provider info
      const provider = data.user.app_metadata?.provider || 'unknown'
      console.log(`User ${data.user.email} logged in via ${provider}`)
      
      // Check if this is a new OAuth login for existing email/password account
      const identities = data.user.identities || []
      if (identities.length > 1) {
        console.log(`Account linking detected: ${identities.length} providers linked`)
      }
    }

    // CLI auth flow: only pass the two tokens required — user_id, email and
    // expires_at are already encoded in the JWT itself, so omitting them here
    // reduces the surface area of data exposed in server logs and browser history.
    if (redirectUri && data.session) {
      const successUrl = new URL(`${origin}/auth/cli/success`)
      successUrl.searchParams.set('access_token', data.session.access_token)
      successUrl.searchParams.set('refresh_token', data.session.refresh_token)
      successUrl.searchParams.set('redirect_uri', redirectUri)

      return NextResponse.redirect(successUrl.toString())
    }

    // If there's a next parameter, redirect there
    if (next) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Default redirect to dashboard
  return NextResponse.redirect(`${origin}/dashboard`)
}
