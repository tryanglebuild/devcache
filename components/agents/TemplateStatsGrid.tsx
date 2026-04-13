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
    <div className="grid grid-cols-4 gap-3">
      <div className="flex items-center gap-2">
        <Star className="w-4 h-4 fill-neutral-300 dark:fill-neutral-600 text-neutral-300 dark:text-neutral-600 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
            {ratingAverage?.toFixed(1) || '0.0'}
          </p>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
            {ratingCount || 0} reviews
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Download className="w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
            {downloadCount || 0}
          </p>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">downloads</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {visibility === 'public' ? (
          <Globe className="w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0" />
        ) : (
          <Lock className="w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0" />
        )}
        <div>
          <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 capitalize">
            {visibility}
          </p>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">visibility</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-neutral-400 dark:text-neutral-500 text-base shrink-0">
          label
        </span>
        <div>
          <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">v{version}</p>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">version</p>
        </div>
      </div>
    </div>
  )
}
