'use client'

import { useEffect, ReactNode } from 'react'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
}

export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter') onConfirm()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onCancel, onConfirm])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-surface-container rounded-2xl shadow-2xl border border-gray-200 dark:border-white/[0.09] w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Icon */}
        <div className="mb-4">
          <Trash2 className="h-6 w-6 text-[#464554] dark:text-on-surface-variant" strokeWidth={1.5} />
        </div>

        {/* Text */}
        <h3 className="text-base font-bold text-gray-900 dark:text-on-surface mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-500 dark:text-on-surface-variant leading-relaxed mb-6">
            {description}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/[0.09] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-container-high transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors',
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
                : 'bg-amber-500 hover:bg-amber-600'
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
