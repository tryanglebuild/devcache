'use client'

import { useState, useEffect } from 'react'
import { DashboardContent } from '@/components/dashboard/DashboardContent'

/**
 * DashboardContentWrapper — Client boundary between the Server Component page
 * and the interactive dashboard. Responsible for loading non-critical
 * (lazy) data — trending agents, public agents — after the initial paint,
 * so the page feels fast even before the heavier data arrives.
 */

interface DashboardContentWrapperProps {
  displayName: string
  userAgents: any[]
  marketplaceStats?: any
  userStats?: any
}

export function DashboardContentWrapper({
  displayName,
  userAgents,
  marketplaceStats,
  userStats
}: DashboardContentWrapperProps) {
  // Holds trending agents and public agents fetched lazily after mount
  const [lazyData, setLazyData] = useState<{
    trendingAgents: any[]
    publicAgents: any[]
    recentActivity: any
  } | null>(null)
  const [isLoadingLazy, setIsLoadingLazy] = useState(true)

  useEffect(() => {
    // Fetch non-critical data after initial render to avoid blocking paint
    const fetchLazyData = async () => {
      try {
        const response = await fetch('/api/dashboard/lazy-data')
        if (response.ok) {
          const data = await response.json()
          setLazyData(data)
        }
      } catch (error) {
        console.error('Failed to fetch lazy data:', error)
        // Provide empty arrays so skeleton loaders don't get stuck
        setLazyData({
          trendingAgents: [],
          publicAgents: [],
          recentActivity: null
        })
      } finally {
        setIsLoadingLazy(false)
      }
    }

    fetchLazyData()
  }, [])

  return (
    <DashboardContent
      displayName={displayName}
      userAgents={userAgents}
      marketplaceStats={marketplaceStats}
      userStats={userStats}
      trendingAgents={lazyData?.trendingAgents || []}
      publicAgents={lazyData?.publicAgents || []}
      isLoadingLazy={isLoadingLazy}
    />
  )
}
