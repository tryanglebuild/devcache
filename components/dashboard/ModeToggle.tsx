'use client'

import { useState, useEffect } from 'react'
import { FolderOpen, Bot, LayoutGrid } from 'lucide-react'

export type DashboardMode = 'projects' | 'agents' | 'unified'

interface ModeToggleProps {
  onModeChange?: (mode: DashboardMode) => void
}

export function ModeToggle({ onModeChange }: ModeToggleProps) {
  const [mode, setMode] = useState<DashboardMode>('agents')
  const [isInitialized, setIsInitialized] = useState(false)

  // Load mode from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('dashboard-mode') as DashboardMode
    if (savedMode && ['projects', 'agents', 'unified'].includes(savedMode)) {
      setMode(savedMode)
    }
    setIsInitialized(true)
  }, [])

  // Notify parent of mode changes after initialization
  useEffect(() => {
    if (isInitialized) {
      onModeChange?.(mode)
    }
  }, [mode, isInitialized, onModeChange])

  const handleModeChange = (newMode: DashboardMode) => {
    setMode(newMode)
    localStorage.setItem('dashboard-mode', newMode)
  }

  return (
    <div className="inline-flex items-center bg-white dark:bg-surface-container rounded-lg p-1 shadow-sm border border-[#c7c4d7]/20 dark:border-white/[0.09]">
      <button
        onClick={() => handleModeChange('projects')}
        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
          mode === 'projects'
            ? 'bg-[#4f46e5] text-white shadow-sm'
            : 'text-[#464554] dark:text-on-surface-variant hover:bg-[#f2f4f6] dark:hover:bg-surface-container-high'
        }`}
      >
        <span className="flex items-center gap-2">
          <FolderOpen size={18} strokeWidth={1.5} />
          Projects
        </span>
      </button>
      
      <button
        onClick={() => handleModeChange('agents')}
        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
          mode === 'agents'
            ? 'bg-[#4f46e5] text-white shadow-sm'
            : 'text-[#464554] dark:text-on-surface-variant hover:bg-[#f2f4f6] dark:hover:bg-surface-container-high'
        }`}
      >
        <span className="flex items-center gap-2">
          <Bot size={18} strokeWidth={1.5} />
          Agents
        </span>
      </button>
      
      <button
        onClick={() => handleModeChange('unified')}
        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
          mode === 'unified'
            ? 'bg-[#4f46e5] text-white shadow-sm'
            : 'text-[#464554] dark:text-on-surface-variant hover:bg-[#f2f4f6] dark:hover:bg-surface-container-high'
        }`}
      >
        <span className="flex items-center gap-2">
          <LayoutGrid size={18} strokeWidth={1.5} />
          All
        </span>
      </button>
    </div>
  )
}

// Hook to use dashboard mode
export function useDashboardMode() {
  const [mode, setMode] = useState<DashboardMode>('agents')

  useEffect(() => {
    const savedMode = localStorage.getItem('dashboard-mode') as DashboardMode
    if (savedMode && ['projects', 'agents', 'unified'].includes(savedMode)) {
      setMode(savedMode)
    }

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dashboard-mode' && e.newValue) {
        setMode(e.newValue as DashboardMode)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return mode
}
