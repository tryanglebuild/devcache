'use client'

import { useState, useEffect } from 'react'

export type DashboardMode = 'projects' | 'agents' | 'unified'

interface ModeToggleProps {
  onModeChange?: (mode: DashboardMode) => void
}

export function ModeToggle({ onModeChange }: ModeToggleProps) {
  const [mode, setMode] = useState<DashboardMode>('unified')
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
    <div className="inline-flex items-center bg-white rounded-lg p-1 shadow-sm border border-[#c7c4d7]/20">
      <button
        onClick={() => handleModeChange('projects')}
        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
          mode === 'projects'
            ? 'bg-[#4648d4] text-white shadow-sm'
            : 'text-[#464554] hover:bg-[#f2f4f6]'
        }`}
      >
        <span className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">folder</span>
          Projects
        </span>
      </button>
      
      <button
        onClick={() => handleModeChange('agents')}
        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
          mode === 'agents'
            ? 'bg-[#4648d4] text-white shadow-sm'
            : 'text-[#464554] hover:bg-[#f2f4f6]'
        }`}
      >
        <span className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">smart_toy</span>
          Agents
        </span>
      </button>
      
      <button
        onClick={() => handleModeChange('unified')}
        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
          mode === 'unified'
            ? 'bg-[#4648d4] text-white shadow-sm'
            : 'text-[#464554] hover:bg-[#f2f4f6]'
        }`}
      >
        <span className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">dashboard</span>
          All
        </span>
      </button>
    </div>
  )
}

// Hook to use dashboard mode
export function useDashboardMode() {
  const [mode, setMode] = useState<DashboardMode>('unified')

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
