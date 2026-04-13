'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal, X, LayoutGrid } from 'lucide-react'
import type { AgentSearchFilters } from '@/types/agents.types'
import { AGENT_CATEGORIES } from '@/types/agents.types'
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from '@/lib/agents/category-icons'

interface MarketplaceFiltersProps {
  filters: AgentSearchFilters
  onFilterChange: (filters: Partial<AgentSearchFilters>) => void
}

export function MarketplaceFilters({ filters, onFilterChange }: MarketplaceFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [searchInput, setSearchInput] = useState(filters.query || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onFilterChange({ query: searchInput })
  }

  const handleClearSearch = () => {
    setSearchInput('')
    onFilterChange({ query: '' })
  }

  const categories = [
    { id: 'all', label: 'All Categories', Icon: LayoutGrid },
    ...Object.entries(AGENT_CATEGORIES).map(([id, cat]) => ({
      id,
      label: cat.label,
      Icon: CATEGORY_ICONS[id] || DEFAULT_CATEGORY_ICON
    }))
  ]

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'downloads', label: 'Most Downloaded' },
    { value: 'trending', label: 'Trending' }
  ]

  const ratingOptions = [
    { value: 0, label: 'All Ratings' },
    { value: 4, label: '4+ Stars' },
    { value: 3, label: '3+ Stars' }
  ]

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search agents by name, description, or tags..."
          className="w-full pl-9 pr-24 py-2.5 bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-lg focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 outline-none text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
        />
        {searchInput && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-16 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 dark:hover:bg-surface-container-high rounded transition-colors"
          >
            <X className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-700 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide flex-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() =>
                onFilterChange({
                  category: category.id === 'all' ? undefined : category.id
                })
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                (category.id === 'all' && !filters.category) ||
                filters.category === category.id
                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                  : 'bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-surface-container-high'
              }`}
            >
              <category.Icon size={14} strokeWidth={1.5} />
              {category.label}
            </button>
          ))}
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            showAdvanced
              ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
              : 'bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-surface-container-high'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sort By */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Sort By
              </label>
              <select
                value={filters.sortBy || 'recent'}
                onChange={(e) =>
                  onFilterChange({
                    sortBy: e.target.value as AgentSearchFilters['sortBy']
                  })
                }
                className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 outline-none text-sm text-neutral-700 dark:text-neutral-300"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Minimum Rating
              </label>
              <select
                value={filters.minRating || 0}
                onChange={(e) =>
                  onFilterChange({ minRating: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 outline-none text-sm text-neutral-700 dark:text-neutral-300"
              >
                {ratingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          {(filters.query || filters.category || (filters.minRating && filters.minRating > 0)) && (
              <div className="pt-3 border-t border-neutral-100 dark:border-white/[0.09]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Active filters</p>
                <button
                  onClick={() =>
                    onFilterChange({
                      query: '',
                      category: undefined,
                      minRating: 0
                    })
                  }
                  className="text-xs font-medium text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {filters.query && (
                  <span className="px-2 py-0.5 bg-neutral-100 dark:bg-surface-container-high text-neutral-600 dark:text-neutral-400 rounded text-[11px] font-medium">
                    Search: "{filters.query}"
                  </span>
                )}
                {filters.category && (
                  <span className="px-2 py-0.5 bg-neutral-100 dark:bg-surface-container-high text-neutral-600 dark:text-neutral-400 rounded text-[11px] font-medium">
                    {AGENT_CATEGORIES[filters.category as keyof typeof AGENT_CATEGORIES]?.label}
                  </span>
                )}
                {filters.minRating && filters.minRating > 0 && (
                  <span className="px-2 py-0.5 bg-neutral-100 dark:bg-surface-container-high text-neutral-600 dark:text-neutral-400 rounded text-[11px] font-medium">
                    {filters.minRating}+ stars
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
