'use client'

import { useMemo } from 'react'
import { Tables } from '@/types/database.types'
import { TrendingUp } from 'lucide-react'

type UserTag = Tables<'user_tags'>

interface TagAnalyticsProps {
  tags: UserTag[]
  tagStats: Record<string, number>
}

export function TagAnalytics({ tags, tagStats }: TagAnalyticsProps) {
  const analytics = useMemo(() => {
    const totalFiles = Object.values(tagStats).reduce((sum, count) => sum + count, 0)
    const usedTags = tags.filter(tag => (tagStats[tag.name] || 0) > 0)
    const unusedTags = tags.filter(tag => (tagStats[tag.name] || 0) === 0)

    const topTags = tags
      .map(tag => ({ ...tag, count: tagStats[tag.name] || 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalFiles,
      usedTags: usedTags.length,
      unusedTags: unusedTags.length,
      topTags,
      avgFilesPerTag: usedTags.length > 0 ? (totalFiles / usedTags.length).toFixed(1) : '0'
    }
  }, [tags, tagStats])

  return (
    <div className="bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-lg p-5">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Used Tags', value: analytics.usedTags },
          { label: 'Unused', value: analytics.unusedTags },
          { label: 'Total Files', value: analytics.totalFiles },
          { label: 'Avg / Tag', value: analytics.avgFilesPerTag },
        ].map(({ label, value }) => (
          <div key={label} className="p-3 bg-neutral-50 dark:bg-surface-container-high rounded-md">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{label}</p>
            <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {/* Top Tags bar chart */}
      {analytics.topTags.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
            <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Most Used
            </h4>
          </div>
          <div className="space-y-2.5">
            {analytics.topTags.map((tag, index) => {
              const percentage = analytics.totalFiles > 0
                ? (tag.count / analytics.totalFiles) * 100
                : 0

              return (
                <div key={tag.id} className="flex items-center gap-3">
                  <span className="text-xs text-neutral-400 dark:text-neutral-500 w-4 tabular-nums shrink-0">
                    {index + 1}
                  </span>
                  <div
                    className="w-4 h-4 rounded shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 flex-1 truncate uppercase text-xs tracking-wide">
                    {tag.name}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-24 h-1.5 bg-neutral-100 dark:bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: tag.color }}
                      />
                    </div>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 w-5 text-right tabular-nums">
                      {tag.count}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
