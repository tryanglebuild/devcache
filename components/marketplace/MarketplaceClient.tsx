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
  initialTotal: number
  marketplaceStats: MarketplaceStats | null
  isAuthenticated: boolean
}

export function MarketplaceClient({
  initialAgents,
  initialTotal,
  marketplaceStats,
  isAuthenticated
}: MarketplaceClientProps) {
  const router = useRouter()
  const [agents, setAgents] = useState<AgentTemplateWithStats[]>(initialAgents)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(Math.ceil(initialTotal / 20))
  const [filters, setFilters] = useState<AgentSearchFilters>({
    query: '',
    category: undefined,
    minRating: 0,
    sortBy: 'recent',
    limit: 20,
    offset: 0
  })
  const itemsPerPage = 20

  // Sync totalPages when initialTotal changes
  useEffect(() => {
    setTotalPages(Math.ceil(initialTotal / 20))
  }, [initialTotal])

  const fetchAgents = async (newFilters: AgentSearchFilters, page: number = 1) => {
    setLoading(true)
    try {
      const offset = (page - 1) * itemsPerPage
      const params = new URLSearchParams()
      if (newFilters.query) params.set('query', newFilters.query)
      if (newFilters.category) params.set('category', newFilters.category)
      if (newFilters.minRating) params.set('minRating', newFilters.minRating.toString())
      params.set('limit', itemsPerPage.toString())
      params.set('offset', offset.toString())

      const response = await fetch(`/api/agents?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setAgents(data.agents)
        setTotalPages(Math.ceil((data.total || data.agents.length) / itemsPerPage))
        
        // Scroll to top when changing pages
        window.scrollTo({ top: 0, behavior: 'smooth' })
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
    setCurrentPage(1)
    fetchAgents(updatedFilters, 1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchAgents(filters, page)
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
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
        fetchAgents(filters, currentPage)
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 bg-white text-[#464554] border border-[#e5e7eb] rounded-lg font-medium hover:bg-[#f2f4f6] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  typeof page === 'number' ? (
                    <button
                      key={`page-${page}`}
                      onClick={() => handlePageChange(page)}
                      disabled={loading}
                      className={`min-w-[40px] h-10 rounded-lg font-medium transition-all ${
                        currentPage === page
                          ? 'bg-[#4648d4] text-white'
                          : 'bg-white text-[#464554] border border-[#e5e7eb] hover:bg-[#f2f4f6]'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 text-[#464554]"
                    >
                      {page}
                    </span>
                  )
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="px-4 py-2 bg-white text-[#464554] border border-[#e5e7eb] rounded-lg font-medium hover:bg-[#f2f4f6] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
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
