'use client'

import type { MarketplaceStats } from '@/types/agents.types'

interface MarketplaceHeroProps {
  stats: MarketplaceStats | null
}

export function MarketplaceHero({ stats: _ }: MarketplaceHeroProps) {
  return (
    <div className="mb-8">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
        Agent Marketplace
      </h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Discover and deploy specialized agents created by the community.
      </p>
    </div>
  )
}
