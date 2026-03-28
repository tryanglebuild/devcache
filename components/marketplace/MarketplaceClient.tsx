'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MarketplaceHero } from './MarketplaceHero'
import { MarketplaceFilters } from './MarketplaceFilters'
import { AgentCard } from '@/components/agents/AgentCard'
import type { AgentTemplateWithStats, MarketplaceStats, AgentSearchFilters } from '@/types/agents.types'
import toast from 'react-hot-toast'

interface MarketplaceClientProps {
  initialAgents: AgentTemplateWithStats[]
  marketplaceStats: MarketplaceStats | null
  isAuthenticated: boolean
}

export function MarketplaceClient({
  initialAgents,
  marketplaceStats,
  isAuthenticated
}: MarketplaceClientProps) {
  const router = useRouter()
  const [agents, setAgents] = useState<AgentTemplateWithStats[]>(initialAgents)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [filters, setFilters] = useState<AgentSearchFilters>({
    query: '',
    category: undefined,
    minRating: 0,
    sortBy: 'recent',
    limit: 20,
    offset: 0
  })

  const fetchAgents = async (newFilters: AgentSearchFilters, append: boolean = false) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (newFilters.query) params.set('query', newFilters.query)
      if (newFilters.category) params.set('category', newFilters.category)
      if (newFilters.minRating) params.set('minRating', newFilters.minRating.toString())
      params.set('limit', (newFilters.limit || 20).toString())
      params.set('offset', (newFilters.offset || 0).toString())

      const response = await fetch(`/api/agents?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        if (append) {
          setAgents(prev => [...prev, ...data.agents])
        } else {
          setAgents(data.agents)
        }
        setHasMore(data.hasMore)
      } else {
        toast.error('Failed to load agents')
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: Partial<AgentSearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, offset: 0 }
    setFilters(updatedFilters)
    fetchAgents(updatedFilters, false)
  }

  const handleLoadMore = () => {
    const updatedFilters = {
      ...filters,
      offset: (filters.offset || 0) + (filters.limit || 20)
    }
    setFilters(updatedFilters)
    fetchAgents(updatedFilters, true)
  }

  const handleViewAgent = (agent: AgentTemplateWithStats) => {
    router.push(`/marketplace/${agent.id}`)
  }

  const handleDownloadAgent = async (agent: AgentTemplateWithStats) => {
    if (!isAuthenticated) {
      toast.error('Please login to download agents')
      router.push('/login')
      return
    }

    try {
      const response = await fetch(`/api/agents/${agent.id}/download`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success(`${agent.name} added to your collection!`)
        // Refresh agent data to update download count
        fetchAgents(filters, false)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to download agent')
      }
    } catch (error) {
      console.error('Error downloading agent:', error)
      toast.error('An error occurred')
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Hero Section */}
      <MarketplaceHero stats={marketplaceStats} />

      {/* Filters */}
      <div className="mb-8">
        <MarketplaceFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Agent Grid */}
      {loading && agents.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 shadow-sm animate-pulse"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#f2f4f6]" />
                <div className="flex-1">
                  <div className="h-4 bg-[#f2f4f6] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#f2f4f6] rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-[#f2f4f6] rounded w-full mb-2" />
              <div className="h-3 bg-[#f2f4f6] rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : agents.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onView={handleViewAgent}
                onDownload={handleDownloadAgent}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-12 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-8 py-3 bg-white text-[#4648d4] border-2 border-[#4648d4] rounded-lg font-bold hover:bg-[#4648d4] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Load More Agents'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f2f4f6] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#464554] text-3xl">
              search_off
            </span>
          </div>
          <p className="text-[#464554] font-medium mb-2">No agents found</p>
          <p className="text-sm text-[#464554] mb-4">
            Try adjusting your filters or search terms
          </p>
          <button
            onClick={() => handleFilterChange({ query: '', category: undefined, minRating: 0 })}
            className="text-[#4648d4] hover:text-[#6063ee] font-semibold text-sm"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}
