'use client'

import { cn } from '@/lib/utils'

interface DevCacheLogoProps {
  /** xs = 24px (footer), sm = 32px (mobile nav), md = 40px (sidebar/nav), lg = 48px (auth panels) */
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /** light = dark text on white bg, dark = light text on dark bg */
  theme?: 'light' | 'dark'
  /** Render only the icon square, no wordmark */
  iconOnly?: boolean
  className?: string
}

const iconSizes = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
}

const textSizes = {
  xs: 'text-base',
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-[1.75rem]',
}

export function DevCacheLogo({
  size = 'md',
  theme = 'light',
  iconOnly = false,
  className,
}: DevCacheLogoProps) {
  const px = iconSizes[size]
  const rx = Math.round(px * 0.27)   // ~27% corner radius

  // Proportional bar layout relative to viewBox (44px base)
  // bars start at x=7, available width=30
  // bottom bar: full width | middle: 70% | top: 43%

  const isDark = theme === 'dark'

  const devColor   = isDark ? 'text-white/70'   : 'text-gray-800'
  const cacheColor = isDark ? 'text-[#818CF8]'  : 'text-[#4F46E5]'
  const dotInner   = isDark ? '#A5B4FC'          : '#4F46E5'

  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      {/* ── Icon ── */}
      <svg
        width={px}
        height={px}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Background */}
        <rect width="44" height="44" rx={rx} fill={isDark ? '#2D2B55' : '#1E1B4B'} />

        {/* L3 cache — bottom, widest, dimmest */}
        <rect x="7" y="31" width="30" height="5.5" rx="2.75" fill="white" fillOpacity="0.28" />
        {/* L2 cache — middle */}
        <rect x="7" y="22.5" width="21" height="5.5" rx="2.75" fill="white" fillOpacity="0.58" />
        {/* L1 cache — top, shortest, brightest */}
        <rect x="7" y="14" width="13" height="5.5" rx="2.75" fill="white" fillOpacity="0.95" />

        {/* Cache-hit indicator dot */}
        <circle cx="37" cy="9" r="5" fill="#818CF8" />
        <circle cx="37" cy="9" r="3" fill={dotInner} />
      </svg>

      {/* ── Wordmark ── */}
      {!iconOnly && (
        <span className={cn('font-sans tracking-tight leading-none', textSizes[size])}>
          <span className={cn('font-normal', devColor)}>dev</span>
          <span className={cn('font-bold', cacheColor)}>Cache</span>
        </span>
      )}
    </div>
  )
}
