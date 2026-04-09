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
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#464554] dark:text-on-surface-variant" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search agents by name, description, or tags..."
          className="w-full pl-12 pr-24 py-3 bg-white dark:bg-surface-container border border-[#c7c4d7]/20 dark:border-white/[0.09] rounded-xl focus:ring-2 focus:ring-[#4f46e5]/20 dark:focus:ring-[#7c7ff5]/20 focus:border-[#4f46e5] dark:focus:border-[#7c7ff5] outline-none text-sm"
        />
        {searchInput && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-16 top-1/2 -translate-y-1/2 p-1 hover:bg-[#f2f4f6] dark:hover:bg-surface-container-high rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-[#464554] dark:text-on-surface-variant" />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#4f46e5] text-white rounded-lg font-semibold text-sm hover:bg-[#4338ca] transition-colors"
        >
          Search
        </button>
      </form>

      {/* Filter Bar */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() =>
                onFilterChange({
                  category: category.id === 'all' ? undefined : category.id
                })
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                (category.id === 'all' && !filters.category) ||
                filters.category === category.id
                  ? 'bg-[#4f46e5] text-white shadow-md'
                  : 'bg-white dark:bg-surface-container text-[#464554] dark:text-on-surface-variant hover:bg-[#f2f4f6] dark:hover:bg-surface-container-high shadow-sm dark:shadow-none'
              }`}
            >
              <category.Icon size={18} strokeWidth={1.5} />
              {category.label}
            </button>
          ))}
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            showAdvanced
              ? 'bg-[#4f46e5] text-white'
              : 'bg-white dark:bg-surface-container text-[#464554] dark:text-on-surface-variant hover:bg-[#f2f4f6] dark:hover:bg-surface-container-high'
          } shadow-sm dark:shadow-none`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="bg-white dark:bg-surface-container rounded-xl p-6 shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/[0.08] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sort By */}
            <div>
              <label className="block text-sm font-bold text-[#191c1e] dark:text-on-surface mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy || 'recent'}
                onChange={(e) =>
                  onFilterChange({
                    sortBy: e.target.value as AgentSearchFilters['sortBy']
                  })
                }
                className="w-full px-4 py-2 bg-white dark:bg-surface-container border border-[#c7c4d7]/20 dark:border-white/[0.09] rounded-lg focus:ring-2 focus:ring-[#4f46e5]/20 dark:focus:ring-[#7c7ff5]/20 focus:border-[#4f46e5] dark:focus:border-[#7c7ff5] outline-none text-sm"
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
              <label className="block text-sm font-bold text-[#191c1e] dark:text-on-surface mb-2">
                Minimum Rating
              </label>
              <select
                value={filters.minRating || 0}
                onChange={(e) =>
                  onFilterChange({ minRating: parseFloat(e.target.value) })
                }
                className="w-full px-4 py-2 bg-white dark:bg-surface-container border border-[#c7c4d7]/20 dark:border-white/[0.09] rounded-lg focus:ring-2 focus:ring-[#4f46e5]/20 dark:focus:ring-[#7c7ff5]/20 focus:border-[#4f46e5] dark:focus:border-[#7c7ff5] outline-none text-sm"
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
            <div className="pt-4 border-t border-[#c7c4d7]/10 dark:border-white/[0.06]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#464554] dark:text-on-surface-variant">
                  Active Filters:
                </p>
                <button
                  onClick={() =>
                    onFilterChange({
                      query: '',
                      category: undefined,
                      minRating: 0
                    })
                  }
                  className="text-sm font-semibold text-[#ba1a1a] dark:text-red-400 hover:text-[#ef4444] dark:hover:text-red-300 transition-colors"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {filters.query && (
                  <span className="px-3 py-1 bg-[#4f46e5]/10 dark:bg-[#7c7ff5]/15 text-[#4f46e5] dark:text-[#7c7ff5] rounded-full text-xs font-semibold">
                    Search: "{filters.query}"
                  </span>
                )}
                {filters.category && (
                  <span className="px-3 py-1 bg-[#4f46e5]/10 dark:bg-[#7c7ff5]/15 text-[#4f46e5] dark:text-[#7c7ff5] rounded-full text-xs font-semibold">
                    Category: {AGENT_CATEGORIES[filters.category as keyof typeof AGENT_CATEGORIES]?.label}
                  </span>
                )}
                {filters.minRating && filters.minRating > 0 && (
                  <span className="px-3 py-1 bg-[#4f46e5]/10 dark:bg-[#7c7ff5]/15 text-[#4f46e5] dark:text-[#7c7ff5] rounded-full text-xs font-semibold">
                    Rating: {filters.minRating}+ stars
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
