import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from '@/components/dashboard/DashboardContent'
import {
  getTrendingAgents,
  getUserAgentCollection,
  getMarketplaceStats,
  getUserAgentStats,
  getPublicAgents
} from '@/lib/agents/queries'

// Disable caching for this page to ensure fresh data on navigation
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  // Fetch project stats
  const { data: projectItems } = await supabase
    .from('project_items')
    .select('*')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })
    .limit(100)

  const totalFolders = projectItems?.filter(item => item.type === 'folder').length || 0
  const totalFiles = projectItems?.filter(item => item.type === 'file').length || 0
  const totalFavorites = projectItems?.filter(item => item.is_favorite).length || 0
  const favoriteItems = projectItems?.filter(item => item.is_favorite) || []

  // Fetch agent data
  const [trendingAgents, userAgents, marketplaceStats, userStats, publicAgents] = await Promise.all([
    getTrendingAgents(10),
    getUserAgentCollection(user!.id),
    getMarketplaceStats(),
    getUserAgentStats(user!.id),
    getPublicAgents(6)
  ])

  // Fetch recent activity
  let recentActivity = null
  try {
    const { data } = await supabase
      .from('activity_log')
      .select(`
        id,
        action_type,
        created_at,
        project_items (
          id,
          name,
          type,
          description
        )
      `)
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(10)
    
    recentActivity = data
  } catch (error) {
    console.error('Failed to fetch activity:', error)
  }

  const displayName = profile?.full_name || user!.email?.split('@')[0] || 'User'

  return (
    <DashboardContent
      displayName={displayName}
      projectItems={projectItems || []}
      favoriteItems={favoriteItems}
      trendingAgents={trendingAgents}
      userAgents={userAgents}
      marketplaceStats={marketplaceStats || undefined}
      userStats={userStats || undefined}
      publicAgents={publicAgents}
      recentActivity={recentActivity}
    />
  )
}
