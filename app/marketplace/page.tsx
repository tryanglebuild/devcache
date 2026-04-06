import { createClient } from '@/lib/supabase/server'
import { MarketplaceClient } from '@/components/marketplace/MarketplaceClient'
import { getPublicAgents, getMarketplaceStats } from '@/lib/agents/queries'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MarketplacePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch initial agents, total count, and stats
  const [agents, countResult, stats] = await Promise.all([
    getPublicAgents(20),
    supabase.rpc('search_agents_count', {
      search_query: null,
      category_filter: null,
      min_rating: 0
    }),
    getMarketplaceStats()
  ])

  const totalCount = countResult.data || agents.length

  return (
    <MarketplaceClient
      initialAgents={agents}
      initialTotal={totalCount}
      marketplaceStats={stats}
      isAuthenticated={!!user}
    />
  )
}
