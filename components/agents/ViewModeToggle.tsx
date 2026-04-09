import { Eye, Code } from 'lucide-react'

interface ViewModeToggleProps {
  viewMode: 'rendered' | 'source'
  onViewModeChange: (mode: 'rendered' | 'source') => void
}

export function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  return (
    <div className="flex gap-2 bg-white p-2 rounded-xl shadow-sm border border-[#e5e7eb] w-fit">
      <button
        onClick={() => onViewModeChange('rendered')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
          viewMode === 'rendered'
            ? 'bg-gradient-to-br from-[#4f46e5] to-[#4338ca] text-white shadow-lg'
            : 'text-[#464554] hover:bg-[#f2f4f6]'
        }`}
      >
        <Eye className="h-4 w-4" />
        Rendered
      </button>
      <button
        onClick={() => onViewModeChange('source')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
          viewMode === 'source'
            ? 'bg-gradient-to-br from-[#4f46e5] to-[#4338ca] text-white shadow-lg'
            : 'text-[#464554] hover:bg-[#f2f4f6]'
        }`}
      >
        <Code className="h-4 w-4" />
        Source
      </button>
    </div>
  )
}
