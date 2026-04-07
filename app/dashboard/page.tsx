import { createClient } from '@/lib/supabase/server'
import { DashboardContentWrapper } from '@/components/dashboard/DashboardContentWrapper'
import {
  getUserAgentCollection,
  getMarketplaceStats,
  getUserAgentStats
} from '@/lib/agents/queries'

// Disable caching for this page to ensure fresh data on navigation
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch only critical data for initial render
  const [profile, projectItems, userAgents, marketplaceStats, userStats] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user!.id)
      .single()
      .then(({ data }) => data),
    supabase
      .from('project_items')
      .select('*')
      .eq('user_id', user!.id)
      .order('updated_at', { ascending: false })
      .limit(20) // Reduced from 100 to 20 for faster initial load
      .then(({ data }) => data),
    getUserAgentCollection(user!.id),
    getMarketplaceStats(),
    getUserAgentStats(user!.id)
  ])

  const favoriteItems = projectItems?.filter(item => item.is_favorite) || []
  const displayName = profile?.full_name || user!.email?.split('@')[0] || 'User'

  return (
    <DashboardContentWrapper
      displayName={displayName}
      projectItems={projectItems || []}
      favoriteItems={favoriteItems}
      userAgents={userAgents}
      marketplaceStats={marketplaceStats || undefined}
      userStats={userStats || undefined}
    />
  )
}
