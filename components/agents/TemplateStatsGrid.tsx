import { Star, Download, Globe, Lock } from 'lucide-react'

interface TemplateStatsGridProps {
  ratingAverage?: number | null
  ratingCount?: number | null
  downloadCount?: number | null
  visibility: string
  version: string
}

export function TemplateStatsGrid({
  ratingAverage,
  ratingCount,
  downloadCount,
  visibility,
  version
}: TemplateStatsGridProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 fill-[#fbbf24] text-[#fbbf24]" />
        <div>
          <p className="font-bold text-[#191c1e]">
            {ratingAverage?.toFixed(1) || '0.0'}
          </p>
          <p className="text-xs text-[#464554]">
            {ratingCount || 0} reviews
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Download className="w-5 h-5 text-[#464554]" />
        <div>
          <p className="font-bold text-[#191c1e]">
            {downloadCount || 0}
          </p>
          <p className="text-xs text-[#464554]">downloads</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {visibility === 'public' ? (
          <Globe className="w-5 h-5 text-[#16a34a]" />
        ) : (
          <Lock className="w-5 h-5 text-[#464554]" />
        )}
        <div>
          <p className="font-bold text-[#191c1e] capitalize">
            {visibility}
          </p>
          <p className="text-xs text-[#464554]">visibility</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[#464554] text-xl">
          label
        </span>
        <div>
          <p className="font-bold text-[#191c1e]">v{version}</p>
          <p className="text-xs text-[#464554]">version</p>
        </div>
      </div>
    </div>
  )
}
