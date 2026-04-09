'use client'

import { Progress } from '@/components/ui/progress'
import { Brain, CheckCircle2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ContextGatheringProgressProps {
  progress: number
  collectedInfo: Record<string, any>
  questionsAsked: string[]
  questionsAnswered: number
  confidenceScore: number
  onDismiss?: () => void
}

export function ContextGatheringProgress({
  progress,
  collectedInfo,
  questionsAsked,
  questionsAnswered,
  confidenceScore,
  onDismiss,
}: ContextGatheringProgressProps) {
  const totalQuestions = questionsAsked.length

  return (
    <div className="bg-gray-50 dark:bg-surface-container-high border border-gray-200 dark:border-white/[0.09] rounded-lg p-4 mb-4 relative">
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 text-gray-500 dark:text-on-surface-variant hover:text-gray-700 dark:hover:text-on-surface hover:bg-gray-200 dark:hover:bg-surface-container"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      <div className="flex items-center gap-2 mb-3">
        <Brain className="h-5 w-5 text-gray-500 dark:text-on-surface-variant animate-pulse" />
        <h3 className="text-sm font-semibold text-gray-700 dark:text-on-surface">
          Gathering context for better results
        </h3>
      </div>

      <Progress value={progress} className="mb-3 h-2" />

      <div className="space-y-2 mb-3">
        {Object.entries(collectedInfo).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-3 w-3 text-gray-500 dark:text-on-surface-variant flex-shrink-0" />
            <span className="text-gray-700 dark:text-on-surface">
              <span className="font-medium">{formatKey(key)}:</span>{' '}
              <span className="text-gray-900 dark:text-on-surface">{formatValue(value)}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500 dark:text-on-surface-variant">
          {questionsAnswered} of {totalQuestions} questions answered
        </span>
        <span className="text-gray-600 dark:text-on-surface-variant font-medium">
          {Math.round(confidenceScore * 100)}% confidence
        </span>
      </div>

      {progress >= 80 && (
        <div className="mt-3 text-xs text-gray-600 dark:text-on-surface-variant bg-gray-100 dark:bg-surface-container border border-gray-200 dark:border-white/[0.09] rounded px-2 py-1">
          ✓ Almost there! One more detail and I'll find the perfect resource.
        </div>
      )}
    </div>
  )
}

function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
}

function formatValue(value: any): string {
  if (Array.isArray(value)) {
    return value.join(', ')
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}
