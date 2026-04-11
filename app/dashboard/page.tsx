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

  // Fetch critical data in parallel — profile is already fetched by layout.tsx,
  // but we need it here for displayName too; use a single shared query scope.
  const [profile, projectItems, favoriteItems, userAgents, marketplaceStats, userStats] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user!.id)
      .single()
      .then(({ data }) => data),
    supabase
      .from('project_items')
      .select('*')
      .eq('user_id', user!.id)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(20)
      .then(({ data }) => data),
    supabase
      .from('project_items')
      .select('*')
      .eq('user_id', user!.id)
      .eq('is_favorite', true)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(20)
      .then(({ data }) => data),
    getUserAgentCollection(user!.id),
    getMarketplaceStats(),
    getUserAgentStats(user!.id)
  ])

  const displayName = profile?.full_name || user!.email?.split('@')[0] || 'User'

  return (
    <DashboardContentWrapper
      displayName={displayName}
      projectItems={projectItems || []}
      favoriteItems={favoriteItems || []}
      userAgents={userAgents}
      marketplaceStats={marketplaceStats || undefined}
      userStats={userStats || undefined}
    />
  )
}
