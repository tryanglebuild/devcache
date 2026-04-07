'use client'

import { useState, useEffect } from 'react'
import { DashboardContent } from '@/components/dashboard/DashboardContent'

interface DashboardContentWrapperProps {
  displayName: string
  projectItems: any[]
  favoriteItems: any[]
  userAgents: any[]
  marketplaceStats?: any
  userStats?: any
}

export function DashboardContentWrapper({
  displayName,
  projectItems,
  favoriteItems,
  userAgents,
  marketplaceStats,
  userStats
}: DashboardContentWrapperProps) {
  const [lazyData, setLazyData] = useState<{
    trendingAgents: any[]
    publicAgents: any[]
    recentActivity: any
  } | null>(null)
  const [isLoadingLazy, setIsLoadingLazy] = useState(true)

  useEffect(() => {
    // Fetch non-critical data after initial render
    const fetchLazyData = async () => {
      try {
        const response = await fetch('/api/dashboard/lazy-data')
        if (response.ok) {
          const data = await response.json()
          setLazyData(data)
        }
      } catch (error) {
        console.error('Failed to fetch lazy data:', error)
        // Set empty data to prevent infinite loading
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
      projectItems={projectItems}
      favoriteItems={favoriteItems}
      userAgents={userAgents}
      marketplaceStats={marketplaceStats}
      userStats={userStats}
      trendingAgents={lazyData?.trendingAgents || []}
      publicAgents={lazyData?.publicAgents || []}
      recentActivity={lazyData?.recentActivity}
      isLoadingLazy={isLoadingLazy}
    />
  )
}
