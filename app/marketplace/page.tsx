import { createClient } from '@/lib/supabase/server'
import { MarketplaceClient } from '@/components/marketplace/MarketplaceClient'
import { getPublicAgents, getMarketplaceStats } from '@/lib/agents/queries'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MarketplacePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch initial agents and stats
  const [agents, stats] = await Promise.all([
    getPublicAgents(20),
    getMarketplaceStats()
  ])

  return (
    <MarketplaceClient
      initialAgents={agents}
      marketplaceStats={stats}
      isAuthenticated={!!user}
    />
  )
}
