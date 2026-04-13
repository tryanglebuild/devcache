import { Eye, Code } from 'lucide-react'

interface ViewModeToggleProps {
  viewMode: 'rendered' | 'source'
  onViewModeChange: (mode: 'rendered' | 'source') => void
}

export function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  return (
    <div className="flex gap-1 bg-neutral-100 dark:bg-surface-container-high p-1 rounded-md w-fit">
      <button
        onClick={() => onViewModeChange('rendered')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
          viewMode === 'rendered'
            ? 'bg-white dark:bg-surface-container text-neutral-900 dark:text-neutral-100 shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
        }`}
      >
        <Eye className="h-3.5 w-3.5" />
        Rendered
      </button>
      <button
        onClick={() => onViewModeChange('source')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
          viewMode === 'source'
            ? 'bg-white dark:bg-surface-container text-neutral-900 dark:text-neutral-100 shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
        }`}
      >
        <Code className="h-3.5 w-3.5" />
        Source
      </button>
    </div>
  )
}
