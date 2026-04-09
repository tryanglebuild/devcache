'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Tables } from '@/types/database.types'
import { Search, Folder, FileText, Tag, X, Loader2 } from 'lucide-react'
import { trackActivity } from '@/lib/activity/track'

type ProjectItem = Tables<'project_items'>
type UserTag = Tables<'user_tags'>

interface SearchResult {
  type: 'file' | 'folder' | 'tag'
  id: string
  name: string
  description?: string | null
  itemType?: string
  color?: string
}

const ITEMS_PER_PAGE = 10
const TAGS_PER_PAGE = 5

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreItems, setHasMoreItems] = useState(false)
  const [hasMoreTags, setHasMoreTags] = useState(false)
  const [itemsPage, setItemsPage] = useState(0)
  const [tagsPage, setTagsPage] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!dropdownRef.current || isLoadingMore || (!hasMoreItems && !hasMoreTags)) return

    const { scrollTop, scrollHeight, clientHeight } = dropdownRef.current
    
    // Load more when user scrolls to bottom (with 50px threshold)
    if (scrollHeight - scrollTop - clientHeight < 50) {
      loadMoreResults()
    }
  }, [isLoadingMore, hasMoreItems, hasMoreTags])

  // Attach scroll listener
  useEffect(() => {
    const dropdown = dropdownRef.current
    if (dropdown) {
      dropdown.addEventListener('scroll', handleScroll)
      return () => dropdown.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // Load more results
  const loadMoreResults = async () => {
    if (isLoadingMore || (!hasMoreItems && !hasMoreTags)) return

    setIsLoadingMore(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const searchTerm = `%${query.toLowerCase()}%`
      const newResults: SearchResult[] = []

      // Load more items if available
      if (hasMoreItems) {
        const nextItemsPage = itemsPage + 1
        const { data: items } = await supabase
          .from('project_items')
          .select('id, name, description, type')
          .eq('user_id', user.id)
          .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .range(nextItemsPage * ITEMS_PER_PAGE, (nextItemsPage + 1) * ITEMS_PER_PAGE - 1)

        if (items && items.length > 0) {
          items.forEach(item => {
            newResults.push({
              type: item.type as 'file' | 'folder',
              id: item.id,
              name: item.name,
              description: item.description,
              itemType: item.type
            })
          })
          setItemsPage(nextItemsPage)
          setHasMoreItems(items.length === ITEMS_PER_PAGE)
        } else {
          setHasMoreItems(false)
        }
      }

      // Load more tags if available
      if (hasMoreTags) {
        const nextTagsPage = tagsPage + 1
        const { data: tags } = await supabase
          .from('user_tags')
          .select('id, name, description, color')
          .eq('user_id', user.id)
          .ilike('name', searchTerm)
          .range(nextTagsPage * TAGS_PER_PAGE, (nextTagsPage + 1) * TAGS_PER_PAGE - 1)

        if (tags && tags.length > 0) {
          tags.forEach(tag => {
            newResults.push({
              type: 'tag',
              id: tag.id,
              name: tag.name,
              description: tag.description,
              color: tag.color
            })
          })
          setTagsPage(nextTagsPage)
          setHasMoreTags(tags.length === TAGS_PER_PAGE)
        } else {
          setHasMoreTags(false)
        }
      }

      setResults(prev => [...prev, ...newResults])
    } catch (error) {
      console.error('Load more error:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Initial search function
  useEffect(() => {
    const searchItems = async () => {
      if (query.trim().length < 2) {
        setResults([])
        setIsOpen(false)
        setItemsPage(0)
        setTagsPage(0)
        setHasMoreItems(false)
        setHasMoreTags(false)
        return
      }

      setIsLoading(true)
      setIsOpen(true)
      setItemsPage(0)
      setTagsPage(0)

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const searchTerm = `%${query.toLowerCase()}%`

        // Search project items (files and folders) - first page
        const { data: items } = await supabase
          .from('project_items')
          .select('id, name, description, type')
          .eq('user_id', user.id)
          .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .range(0, ITEMS_PER_PAGE - 1)

        // Search tags - first page
        const { data: tags } = await supabase
          .from('user_tags')
          .select('id, name, description, color')
          .eq('user_id', user.id)
          .ilike('name', searchTerm)
          .range(0, TAGS_PER_PAGE - 1)

        const searchResults: SearchResult[] = []

        // Add items to results
        if (items) {
          items.forEach(item => {
            searchResults.push({
              type: item.type as 'file' | 'folder',
              id: item.id,
              name: item.name,
              description: item.description,
              itemType: item.type
            })
          })
          setHasMoreItems(items.length === ITEMS_PER_PAGE)
        }

        // Add tags to results
        if (tags) {
          tags.forEach(tag => {
            searchResults.push({
              type: 'tag',
              id: tag.id,
              name: tag.name,
              description: tag.description,
              color: tag.color
            })
          })
          setHasMoreTags(tags.length === TAGS_PER_PAGE)
        }

        setResults(searchResults)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(searchItems, 300)
    return () => clearTimeout(debounce)
  }, [query, supabase])

  const handleResultClick = async (result: SearchResult) => {
    setIsOpen(false)
    setQuery('')

    if (result.type === 'tag') {
      router.push('/dashboard/tags')
    } else {
      // Track activity for files/folders
      await trackActivity(result.id, 'view')
      
      const url = result.type === 'folder' 
        ? `/dashboard/projects/${result.id}` 
        : `/dashboard/projects/file/${result.id}`
      router.push(url)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    setItemsPage(0)
    setTagsPage(0)
    setHasMoreItems(false)
    setHasMoreTags(false)
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-xl">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#464554] dark:text-on-surface-variant group-focus-within:text-[#4f46e5] dark:group-focus-within:text-[#7c7ff5] transition-colors" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Quick search projects, templates, or snippets..."
          className="w-full pl-12 pr-10 py-2.5 bg-white dark:bg-surface-container border border-[#c7c4d7]/20 dark:border-white/[0.09] rounded-xl focus:ring-2 focus:ring-[#4f46e5]/20 dark:focus:ring-[#7c7ff5]/20 focus:border-[#4f46e5] dark:focus:border-[#7c7ff5] outline-none text-sm transition-all"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#f2f4f6] dark:hover:bg-surface-container-high rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-[#464554] dark:text-on-surface-variant" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full bg-white dark:bg-surface-container border border-[#c7c4d7]/20 dark:border-white/[0.09] rounded-xl shadow-xl max-h-96 overflow-y-auto z-50"
        >
          {isLoading ? (
            <div className="p-4 text-center text-[#464554] dark:text-on-surface-variant text-sm">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="py-2">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 hover:bg-[#f7f9fb] dark:hover:bg-surface-container-high transition-colors flex items-start gap-3 text-left"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      result.type === 'folder' 
                        ? 'bg-[#4f46e5]/10 dark:bg-[#7c7ff5]/15 text-[#4f46e5] dark:text-[#7c7ff5]'
                        : result.type === 'file'
                        ? 'bg-[#575992]/10 dark:bg-[#8b8cc7]/15 text-[#575992] dark:text-[#a5a6e6]'
                        : 'bg-[#904900]/10 text-[#904900]'
                    }`}>
                      {result.type === 'folder' && <Folder className="h-4 w-4" />}
                      {result.type === 'file' && <FileText className="h-4 w-4" />}
                      {result.type === 'tag' && <Tag className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#191c1e] dark:text-on-surface text-sm truncate">
                          {result.name}
                        </p>
                        <span className="text-[10px] font-bold text-[#464554] dark:text-on-surface-variant uppercase tracking-wider flex-shrink-0">
                          {result.type}
                        </span>
                      </div>
                      {result.description && (
                        <p className="text-xs text-[#464554] dark:text-on-surface-variant truncate mt-0.5">
                          {result.description}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Loading more indicator */}
              {isLoadingMore && (
                <div className="p-4 flex items-center justify-center gap-2 text-[#464554] dark:text-on-surface-variant text-sm border-t border-[#c7c4d7]/10 dark:border-white/[0.06]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading more...</span>
                </div>
              )}
              
              {/* End of results indicator */}
              {!hasMoreItems && !hasMoreTags && !isLoadingMore && results.length > 0 && (
                <div className="p-3 text-center text-xs text-[#464554] dark:text-on-surface-variant border-t border-[#c7c4d7]/10 dark:border-white/[0.06]">
                  End of results
                </div>
              )}
            </>
          ) : (
            <div className="p-4 text-center text-[#464554] dark:text-on-surface-variant text-sm">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}
