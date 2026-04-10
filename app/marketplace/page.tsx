import { createClient } from '@/lib/supabase/server'
import { MarketplaceClient } from '@/components/marketplace/MarketplaceClient'
import { getPublicAgents, getMarketplaceStats } from '@/lib/agents/queries'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MarketplacePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch initial agents, total count, stats, and user's saved collection
  const [agents, countResult, stats, collectionResult] = await Promise.all([
    getPublicAgents(20),
    supabase.rpc('search_agents_count', {
      search_query: null,
      category_filter: null,
      min_rating: 0
    }),
    getMarketplaceStats(),
    user
      ? supabase
          .from('agent_collections')
          .select('agent_id')
          .eq('user_id', user.id)
      : Promise.resolve({ data: [] })
  ])

  const totalCount = countResult.data || agents.length
  const savedAgentIds = new Set(
    (collectionResult.data || []).map((c: { agent_id: string }) => c.agent_id)
  )

  // Attach is_in_collection to agents
  const agentsWithCollection = agents.map(a => ({
    ...a,
    is_in_collection: savedAgentIds.has(a.id)
  }))

  return (
    <MarketplaceClient
      initialAgents={agentsWithCollection}
      initialTotal={totalCount}
      marketplaceStats={stats}
      isAuthenticated={!!user}
    />
  )
}
