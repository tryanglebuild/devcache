'use client'

import type { MarketplaceStats } from '@/types/agents.types'

interface MarketplaceHeroProps {
  stats: MarketplaceStats | null
}

export function MarketplaceHero({ stats: _ }: MarketplaceHeroProps) {
  return (
    <div className="mb-10">
      <h1 className="text-3xl font-black tracking-tight text-[#191c1e] dark:text-on-surface mb-2">
        Agent Marketplace
      </h1>
      <p className="text-sm text-[#464554] dark:text-on-surface-variant">
        Discover and deploy specialized agents created by the community.
      </p>
    </div>
  )
}
