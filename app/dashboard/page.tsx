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

/**
 * Dashboard page — Server Component.
 * Fetches only the data needed for the initial render (profile, agent collection,
 * marketplace stats). Heavy / paginated data (projects, activity) is loaded
 * client-side inside DashboardContentWrapper to keep TTFB fast.
 */
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Only fetch critical, non-paginated data server-side.
  // projectItems and favoriteItems are fetched client-side with pagination.
  const [profile, userAgents, marketplaceStats, userStats] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user!.id)
      .single()
      .then(({ data }) => data),
    getUserAgentCollection(user!.id),
    getMarketplaceStats(),
    getUserAgentStats(user!.id)
  ])

  // Fall back to the email prefix when the user has no display name set
  const displayName = profile?.full_name || user!.email?.split('@')[0] || 'User'

  return (
    <DashboardContentWrapper
      displayName={displayName}
      userAgents={userAgents}
      marketplaceStats={marketplaceStats || undefined}
      userStats={userStats || undefined}
    />
  )
}
