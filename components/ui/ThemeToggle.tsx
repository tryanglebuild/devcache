'use client'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/components/providers/ThemeProvider'

interface ThemeToggleProps {
  /** Show only sun/moon (no system option). Default: false */
  simple?: boolean
  /** Additional CSS classes */
  className?: string
}

export function ThemeToggle({ simple = false, className = '' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()

  if (simple) {
    return (
      <button
        onClick={toggleTheme}
        className={`relative inline-flex items-center justify-center w-9 h-9 rounded-lg 
          text-on-surface-variant hover:text-on-surface
          hover:bg-surface-container-high
          transition-colors duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
          ${className}`}
        aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
      >
        <Sun className="h-[1.125rem] w-[1.125rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.125rem] w-[1.125rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </button>
    )
  }

  // Three-state toggle: light / system / dark
  const options = [
    { value: 'light' as const, icon: Sun, label: 'Light mode' },
    { value: 'system' as const, icon: Monitor, label: 'System theme' },
    { value: 'dark' as const, icon: Moon, label: 'Dark mode' },
  ]

  return (
    <div className={`inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-surface-container ${className}`}>
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            ${theme === value
              ? 'bg-surface-container-highest text-on-surface shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          aria-label={label}
          aria-pressed={theme === value}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  )
}
