import { createClient } from '@/lib/supabase/server'
import { MarketplaceLayoutClient } from './layout-client'

export default async function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let displayName = 'Guest'
  let jobTitle = 'Visitor'
  let email = ''
  let createdAt = undefined

  if (user) {
    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    displayName = profile?.full_name || user.email?.split('@')[0] || 'User'
    jobTitle = profile?.job_title || 'Developer'
    email = user.email || ''
    createdAt = user.created_at
  }

  return (
    <MarketplaceLayoutClient
      displayName={displayName}
      jobTitle={jobTitle}
      email={email}
      createdAt={createdAt}
      isAuthenticated={!!user}
    >
      {children}
    </MarketplaceLayoutClient>
  )
}
