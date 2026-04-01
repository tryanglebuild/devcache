'use client'

import { useMemo } from 'react'
import { Tables } from '@/types/database.types'
import { BarChart3, PieChart, TrendingUp } from 'lucide-react'

type LanguageTag = Tables<'language_tags'>

interface TagAnalyticsProps {
  tags: LanguageTag[]
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
    <div className="bg-white p-6 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#4648d4]/10 flex items-center justify-center">
          <BarChart3 className="h-5 w-5 text-[#4648d4]" />
        </div>
        <div>
          <h3 className="font-bold text-[#191c1e]">Tag Analytics</h3>
          <p className="text-xs text-[#464554]">Usage insights and statistics</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 bg-[#f8f9fa] rounded-lg">
          <p className="text-xs text-[#464554] mb-1">Used Tags</p>
          <p className="text-xl font-black text-[#191c1e]">{analytics.usedTags}</p>
        </div>
        <div className="p-3 bg-[#f8f9fa] rounded-lg">
          <p className="text-xs text-[#464554] mb-1">Unused</p>
          <p className="text-xl font-black text-[#464554]">{analytics.unusedTags}</p>
        </div>
        <div className="p-3 bg-[#f8f9fa] rounded-lg">
          <p className="text-xs text-[#464554] mb-1">Total Files</p>
          <p className="text-xl font-black text-[#191c1e]">{analytics.totalFiles}</p>
        </div>
        <div className="p-3 bg-[#f8f9fa] rounded-lg">
          <p className="text-xs text-[#464554] mb-1">Avg/Tag</p>
          <p className="text-xl font-black text-[#191c1e]">{analytics.avgFilesPerTag}</p>
        </div>
      </div>

      {/* Top Tags */}
      {analytics.topTags.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-[#4648d4]" />
            <h4 className="text-xs font-bold text-[#191c1e] uppercase tracking-wider">
              Most Used Tags
            </h4>
          </div>
          <div className="space-y-2">
            {analytics.topTags.map((tag, index) => {
              const percentage = analytics.totalFiles > 0 
                ? (tag.count / analytics.totalFiles) * 100 
                : 0

              return (
                <div key={tag.id} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-bold text-[#464554] w-4">
                      {index + 1}
                    </span>
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-[#191c1e] uppercase">
                      {tag.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-[#f2f4f6] rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: tag.color
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#464554] w-8 text-right">
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
