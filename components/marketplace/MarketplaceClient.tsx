'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SearchX } from 'lucide-react'
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
      toast.error('Please login to save agents')
      router.push('/login')
      return
    }

    if (agent.is_in_collection) {
      toast.success(`${agent.name} is already saved in My Templates`)
      return
    }

    try {
      const response = await fetch(`/api/agents/${agent.id}/download`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.alreadyExists) {
          toast.success(`${agent.name} is already in My Templates!`)
        } else {
          toast.success(`${agent.name} saved to My Templates!`)
        }
        // Mark as saved in local state
        setAgents(prev => prev.map(a =>
          a.id === agent.id ? { ...a, is_in_collection: true } : a
        ))
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to save agent')
      }
    } catch (error) {
      console.error('Error saving agent:', error)
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-lg p-4 animate-pulse"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-surface-container-high" />
                <div className="flex-1">
                  <div className="h-3.5 bg-neutral-100 dark:bg-surface-container-high rounded w-3/4 mb-2" />
                  <div className="h-3 bg-neutral-100 dark:bg-surface-container-high rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-neutral-100 dark:bg-surface-container-high rounded w-full mb-2" />
              <div className="h-3 bg-neutral-100 dark:bg-surface-container-high rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : agents.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onView={handleViewAgent}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-1.5">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="px-3 py-1.5 text-xs bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 rounded-md font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
                      className={`min-w-[32px] h-8 text-xs rounded-md font-medium transition-all ${
                        currentPage === page
                          ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                          : 'bg-white dark:bg-surface-container text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-white/[0.09] hover:bg-neutral-50 dark:hover:bg-surface-container-high'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-1 text-xs text-neutral-400 dark:text-neutral-600"
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
                className="px-3 py-1.5 text-xs bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 rounded-md font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-neutral-50 dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-lg p-10 text-center">
          <SearchX size={24} strokeWidth={1.5} className="mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">No agents found</p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-4">
            Try adjusting your filters or search terms
          </p>
          <button
            onClick={() => handleFilterChange({ query: '', category: undefined, minRating: 0 })}
            className="text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 underline underline-offset-2 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}
