'use client'

import { Toaster } from 'react-hot-toast'
import { useTheme } from '@/components/providers/ThemeProvider'

export function ThemedToaster() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: isDark ? '#1e2540' : '#191c1e',
          color: isDark ? '#e3e6f7' : '#fff',
          borderRadius: '12px',
          padding: '16px',
          ...(isDark ? { border: '1px solid rgba(255,255,255,0.09)' } : {}),
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: isDark ? '#e3e6f7' : '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: isDark ? '#f87171' : '#ba1a1a',
            secondary: isDark ? '#e3e6f7' : '#fff',
          },
        },
      }}
    />
  )
}
