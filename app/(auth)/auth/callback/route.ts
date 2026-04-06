import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')
  const redirectUri = requestUrl.searchParams.get('redirect_uri')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }

    // If this is a CLI auth flow, redirect to success page with tokens
    if (redirectUri && data.session) {
      const successUrl = new URL(`${origin}/auth/cli/success`)
      successUrl.searchParams.set('access_token', data.session.access_token)
      successUrl.searchParams.set('refresh_token', data.session.refresh_token)
      successUrl.searchParams.set('user_id', data.user.id)
      successUrl.searchParams.set('email', data.user.email || '')
      successUrl.searchParams.set('expires_at', data.session.expires_at?.toString() || '')
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
