'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react'
import { AgentCard } from './AgentCard'
import type { AgentTemplateWithStats } from '@/types/agents.types'

interface TrendingAgentsCarouselProps {
  agents: AgentTemplateWithStats[]
  onViewAgent?: (agent: AgentTemplateWithStats) => void
}

export function TrendingAgentsCarousel({
  agents,
  onViewAgent
}: TrendingAgentsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    setCanScrollLeft(container.scrollLeft > 0)
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    )
  }

  useEffect(() => {
    checkScroll()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScroll)
      return () => container.removeEventListener('scroll', checkScroll)
    }
  }, [agents])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = container.clientWidth * 0.8
    const newScrollLeft =
      direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    })
  }

  if (!agents || agents.length === 0) {
    return (
      <div className="bg-white dark:bg-surface-container rounded-xl p-12 text-center shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] dark:shadow-none dark:ring-1 dark:ring-white/[0.08]">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f2f4f6] dark:bg-surface-container-high flex items-center justify-center">
          <TrendingUp size={28} strokeWidth={1.5} className="text-slate-500 dark:text-on-surface-variant" />
        </div>
        <p className="text-[#464554] dark:text-on-surface-variant font-medium">No trending agents yet</p>
        <p className="text-sm text-[#464554] dark:text-on-surface-variant mt-2">Check back soon for popular agents</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Scroll Buttons */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-surface-container rounded-full shadow-lg dark:ring-1 dark:ring-white/[0.09] flex items-center justify-center hover:bg-[#f2f4f6] dark:hover:bg-surface-container-high transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-[#191c1e] dark:text-on-surface" />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-surface-container rounded-full shadow-lg dark:ring-1 dark:ring-white/[0.09] flex items-center justify-center hover:bg-[#f2f4f6] dark:hover:bg-surface-container-high transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-[#191c1e] dark:text-on-surface" />
        </button>
      )}

      {/* Carousel Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {agents.map((agent) => (
          <div key={agent.id} className="flex-shrink-0 w-80">
            <AgentCard
              agent={agent}
              onView={onViewAgent}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
