'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Search, Zap, Database, Brain, CheckCircle2, Clock } from 'lucide-react'
import type { ThinkingStep } from '@/types/chat'

interface ThinkingProcessProps {
  steps: ThinkingStep[]
  isComplete?: boolean
}

export function ThinkingProcess({ steps, isComplete = false }: ThinkingProcessProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (steps.length === 0) return null

  const getIcon = (type: ThinkingStep['type']) => {
    switch (type) {
      case 'analysis':
        return <Brain className="w-4 h-4 text-gray-500 dark:text-on-surface-variant" />
      case 'search':
        return <Search className="w-4 h-4 text-gray-500 dark:text-on-surface-variant" />
      case 'tool_call':
        return <Zap className="w-4 h-4 text-gray-500 dark:text-on-surface-variant" />
      case 'tool_result':
        return <CheckCircle2 className="w-4 h-4 text-gray-500 dark:text-on-surface-variant" />
      case 'context':
        return <Database className="w-4 h-4 text-gray-500 dark:text-on-surface-variant" />
      default:
        return <Clock className="w-4 h-4 text-gray-500 dark:text-on-surface-variant" />
    }
  }

  const getTypeLabel = (type: ThinkingStep['type']) => {
    switch (type) {
      case 'analysis':
        return 'Analyzing'
      case 'search':
        return 'Searching'
      case 'tool_call':
        return 'Using Tool'
      case 'tool_result':
        return 'Tool Result'
      case 'context':
        return 'Loading Context'
      default:
        return 'Processing'
    }
  }

  const totalDuration = steps.reduce((sum, step) => sum + (step.duration || 0), 0)

  return (
    <div className="mb-4 border border-gray-200 dark:border-white/[0.09] rounded-lg bg-gradient-to-br from-gray-50 dark:from-surface-container-high to-white dark:to-surface-container shadow-sm dark:shadow-none">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-surface-container-high/50 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-on-surface-variant" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500 dark:text-on-surface-variant" />
          )}
          <Brain className="w-4 h-4 text-gray-500 dark:text-on-surface-variant" />
          <span className="text-sm font-medium text-gray-700 dark:text-on-surface">
            {isComplete ? 'Analysis Complete' : 'Analyzing...'}
          </span>
          <span className="text-xs text-gray-500 dark:text-on-surface-variant">
            {steps.length} step{steps.length !== 1 ? 's' : ''}
          </span>
          {totalDuration > 0 && (
            <span className="text-xs text-gray-400 dark:text-on-surface-variant">
              · {(totalDuration / 1000).toFixed(2)}s
            </span>
          )}
        </div>
        {isComplete && (
          <CheckCircle2 className="w-4 h-4 text-gray-500 dark:text-on-surface-variant" />
        )}
      </button>

      {/* Steps */}
      {isExpanded && (
        <div className="px-4 pb-3 space-y-2">
          {steps.map((step, index) => (
            <ThinkingStepItem
              key={`${step.type}-${index}`}
              step={step}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface ThinkingStepItemProps {
  step: ThinkingStep
  index: number
}

function ThinkingStepItem({ step, index }: ThinkingStepItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasDetails = step.description || step.data

  const getIcon = (type: ThinkingStep['type']) => {
    switch (type) {
      case 'analysis':
        return <Brain className="w-3.5 h-3.5 text-gray-500 dark:text-on-surface-variant" />
      case 'search':
        return <Search className="w-3.5 h-3.5 text-gray-500 dark:text-on-surface-variant" />
      case 'tool_call':
        return <Zap className="w-3.5 h-3.5 text-gray-500 dark:text-on-surface-variant" />
      case 'tool_result':
        return <CheckCircle2 className="w-3.5 h-3.5 text-gray-500 dark:text-on-surface-variant" />
      case 'context':
        return <Database className="w-3.5 h-3.5 text-gray-500 dark:text-on-surface-variant" />
      default:
        return <Clock className="w-3.5 h-3.5 text-gray-500 dark:text-on-surface-variant" />
    }
  }

  const getBgColor = (type: ThinkingStep['type']) => {
    switch (type) {
      case 'analysis':
        return 'bg-gray-50 dark:bg-surface-container-high border-gray-200 dark:border-white/[0.09]'
      case 'search':
        return 'bg-gray-50 dark:bg-surface-container-high border-gray-200 dark:border-white/[0.09]'
      case 'tool_call':
        return 'bg-gray-50 dark:bg-surface-container-high border-gray-200 dark:border-white/[0.09]'
      case 'tool_result':
        return 'bg-gray-50 dark:bg-surface-container-high border-gray-200 dark:border-white/[0.09]'
      case 'context':
        return 'bg-gray-50 dark:bg-surface-container-high border-gray-200 dark:border-white/[0.09]'
      default:
        return 'bg-gray-50 dark:bg-surface-container-high border-gray-200 dark:border-white/[0.09]'
    }
  }

  return (
    <div className={`border rounded-md ${getBgColor(step.type)} overflow-hidden`}>
      <button
        onClick={() => hasDetails && setIsExpanded(!isExpanded)}
        className={`w-full px-3 py-2 flex items-start gap-2 text-left ${
          hasDetails ? 'hover:bg-white/50 dark:hover:bg-surface-container/50 cursor-pointer' : 'cursor-default'
        } transition-colors`}
      >
        <div className="flex-shrink-0 mt-0.5">
          {getIcon(step.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-700 dark:text-on-surface">
              {step.title}
            </span>
            {step.duration && (
              <span className="text-[10px] text-gray-400 dark:text-on-surface-variant">
                {step.duration}ms
              </span>
            )}
          </div>
          {!isExpanded && step.description && (
            <p className="text-xs text-gray-600 dark:text-on-surface-variant mt-0.5 line-clamp-1">
              {step.description}
            </p>
          )}
        </div>
        {hasDetails && (
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-on-surface-variant" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-on-surface-variant" />
            )}
          </div>
        )}
      </button>

      {isExpanded && hasDetails && (
        <div className="px-3 pb-2 space-y-2">
          {step.description && (
            <p className="text-xs text-gray-600 dark:text-on-surface-variant leading-relaxed">
              {step.description}
            </p>
          )}
          {step.data && (
            <div className="bg-white/70 dark:bg-surface-container/70 rounded border border-gray-200 dark:border-white/[0.09] p-2">
              <pre className="text-[10px] text-gray-700 dark:text-on-surface overflow-x-auto">
                {typeof step.data === 'string'
                  ? step.data
                  : JSON.stringify(step.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
