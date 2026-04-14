'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, SlidersHorizontal } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Database } from '@/types/database.types'

type Preferences = Database['public']['Tables']['user_model_preferences']['Row']

interface PreferencesSettingsProps {
  preferences: Preferences | null
  userId: string
}

const AI_MODELS = [
  { 
    id: 'anthropic/claude-3-haiku', 
    name: 'Claude 3 Haiku', 
    description: 'Fast and efficient',
    provider: 'Anthropic',
    contextWindow: '200K tokens',
    costMultiplier: 1.0,
    strengths: ['Speed', 'Cost-effective', 'Quick responses'],
    bestFor: 'Simple tasks, quick queries, high-volume usage'
  },
  { 
    id: 'anthropic/claude-3-sonnet', 
    name: 'Claude 3 Sonnet', 
    description: 'Balanced performance',
    provider: 'Anthropic',
    contextWindow: '200K tokens',
    costMultiplier: 3.0,
    strengths: ['Balanced', 'Versatile', 'Good reasoning'],
    bestFor: 'General purpose, complex conversations, code analysis'
  },
  { 
    id: 'anthropic/claude-3-opus', 
    name: 'Claude 3 Opus', 
    description: 'Most capable',
    provider: 'Anthropic',
    contextWindow: '200K tokens',
    costMultiplier: 15.0,
    strengths: ['Advanced reasoning', 'Complex tasks', 'Highest quality'],
    bestFor: 'Critical tasks, complex problem-solving, research'
  },
  { 
    id: 'openai/gpt-4o', 
    name: 'GPT-4o', 
    description: 'OpenAI flagship model',
    provider: 'OpenAI',
    contextWindow: '128K tokens',
    costMultiplier: 5.0,
    strengths: ['Multimodal', 'Fast', 'Reliable'],
    bestFor: 'Vision tasks, general purpose, production apps'
  },
  { 
    id: 'openai/gpt-4o-mini', 
    name: 'GPT-4o Mini', 
    description: 'Fast and affordable',
    provider: 'OpenAI',
    contextWindow: '128K tokens',
    costMultiplier: 0.6,
    strengths: ['Very fast', 'Low cost', 'Efficient'],
    bestFor: 'High-volume tasks, simple queries, testing'
  },
]

export function PreferencesSettings({ preferences, userId }: PreferencesSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [defaultModel, setDefaultModel] = useState(
    preferences?.default_model || 'anthropic/claude-3-haiku'
  )
  const [threshold, setThreshold] = useState<number>(
    preferences && 'search_relevance_threshold' in preferences
      ? Number((preferences as any).search_relevance_threshold ?? 0.3)
      : 0.3
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ default_model: defaultModel, search_relevance_threshold: threshold }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update preferences')
      }

      toast.success('Preferences updated successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update preferences')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-white dark:bg-surface-container border-neutral-200 dark:border-white/[0.09] shadow-none">
      <CardHeader className="pb-4 border-b border-neutral-100 dark:border-white/[0.06]">
        <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-on-surface">AI Model Preferences</CardTitle>
        <CardDescription className="text-sm text-neutral-500 dark:text-on-surface-variant">
          Choose your default AI model and search settings
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Model Select */}
          <div className="space-y-1.5">
            <Label htmlFor="default_model" className="text-sm font-medium text-neutral-700 dark:text-on-surface-variant">
              Default AI Model
            </Label>
            <Select value={defaultModel} onValueChange={setDefaultModel}>
              <SelectTrigger className="border-neutral-200 dark:border-white/[0.09] bg-white dark:bg-surface-container-high h-10 text-sm">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] shadow-md p-1 min-w-[480px]">
                {AI_MODELS.map((model) => (
                  <SelectItem
                    key={model.id}
                    value={model.id}
                    className="cursor-pointer rounded-md my-0.5 pl-3 pr-10 py-2.5 hover:bg-neutral-50 dark:hover:bg-white/[0.05] data-[state=checked]:bg-neutral-100 dark:data-[state=checked]:bg-white/[0.08] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-6 w-full pr-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-sm text-neutral-900 dark:text-on-surface">
                            {model.name}
                          </span>
                          <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-white/[0.08] rounded text-[10px] font-medium text-neutral-500 dark:text-on-surface-variant border border-neutral-200 dark:border-white/[0.09]">
                            {model.provider}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 dark:text-on-surface-variant/60 truncate">
                          {model.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <div className="text-xs font-semibold text-neutral-700 dark:text-on-surface-variant">
                              {model.costMultiplier}x
                            </div>
                            <div className="text-[10px] text-neutral-400 dark:text-on-surface-variant/60">cost</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-semibold text-neutral-700 dark:text-on-surface-variant">
                              {model.contextWindow.split(' ')[0]}
                            </div>
                            <div className="text-[10px] text-neutral-400 dark:text-on-surface-variant/60">tokens</div>
                          </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-neutral-400 dark:text-on-surface-variant/60">
              This model will be used by default in new chat sessions
            </p>
          </div>

          {/* Selected Model Details */}
          {defaultModel && (() => {
            const selectedModel = AI_MODELS.find(m => m.id === defaultModel)
            if (!selectedModel) return null

            return (
              <div className="space-y-3">
                <div className="p-4 bg-neutral-50 dark:bg-surface-container-high border border-neutral-200 dark:border-white/[0.09] rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-neutral-900 dark:text-on-surface">
                          {selectedModel.name}
                        </span>
                        <span className="px-1.5 py-0.5 bg-white dark:bg-surface-container rounded text-[10px] font-medium text-neutral-500 dark:text-on-surface-variant border border-neutral-200 dark:border-white/[0.09]">
                          {selectedModel.provider}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-on-surface-variant">{selectedModel.description}</p>
                    </div>
                    <span className="text-[10px] font-medium text-neutral-400 dark:text-on-surface-variant/60 bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded px-2 py-1">
                      Selected
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-on-surface-variant border-t border-neutral-200 dark:border-white/[0.09] pt-3">
                    <span className="font-medium text-neutral-700 dark:text-on-surface">Best for:</span> {selectedModel.bestFor}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white dark:bg-surface-container-high border border-neutral-200 dark:border-white/[0.09] rounded-lg">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-on-surface-variant/60 mb-1.5">
                      Cost Multiplier
                    </p>
                    <p className="text-xl font-semibold text-neutral-900 dark:text-on-surface">
                      {selectedModel.costMultiplier}x
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-on-surface-variant/60 mt-0.5">
                      {selectedModel.costMultiplier <= 1 ? 'Most economical' : selectedModel.costMultiplier <= 5 ? 'Moderate pricing' : 'Premium tier'}
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-surface-container-high border border-neutral-200 dark:border-white/[0.09] rounded-lg">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-on-surface-variant/60 mb-1.5">
                      Context Window
                    </p>
                    <p className="text-xl font-semibold text-neutral-900 dark:text-on-surface">
                      {selectedModel.contextWindow.split(' ')[0]}
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-on-surface-variant/60 mt-0.5">tokens max</p>
                  </div>
                </div>

                  <div className="p-3 bg-white dark:bg-surface-container-high border border-neutral-200 dark:border-white/[0.09] rounded-lg">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-on-surface-variant/60 mb-2">
                      Key Capabilities
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedModel.strengths.map((strength, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-neutral-50 dark:bg-surface-container rounded text-xs text-neutral-600 dark:text-on-surface-variant border border-neutral-200 dark:border-white/[0.09]"
                        >
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Search Relevance Threshold */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-neutral-400" />
              <Label className="text-sm font-medium text-neutral-700 dark:text-on-surface-variant">
                Search Relevance Threshold
              </Label>
            </div>
            <p className="text-xs text-neutral-400 dark:text-on-surface-variant/60 -mt-2">
              Controls how closely results must match your query before being shown in chat
            </p>

            <div className="p-4 bg-neutral-50 dark:bg-surface-container-high border border-neutral-200 dark:border-white/[0.09] rounded-lg space-y-4">
              <div className="flex justify-between text-[10px] font-medium uppercase tracking-wide text-neutral-400 dark:text-on-surface-variant/60">
                <span>Broad</span>
                <span>Balanced</span>
                <span>Strict</span>
              </div>

              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-neutral-200"
                style={{
                  background: `linear-gradient(to right, #404040 ${threshold * 100}%, #e5e7eb ${threshold * 100}%)`,
                }}
              />

              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-neutral-900 dark:text-on-surface">
                  {Math.round(threshold * 100)}%
                  <span className="text-xs font-normal text-neutral-400 dark:text-on-surface-variant/60 ml-1.5">minimum match</span>
                </span>
                <span className="text-xs text-neutral-500 dark:text-on-surface-variant bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded px-2 py-1">
                  {threshold <= 0.2 ? 'Broad' : threshold <= 0.5 ? 'Balanced' : threshold <= 0.75 ? 'Focused' : 'Strict'}
                </span>
              </div>

              <p className="text-xs text-neutral-400 dark:text-on-surface-variant/60 leading-relaxed border-t border-neutral-200 dark:border-white/[0.09] pt-3">
                Lower values return more results (including loosely related ones); higher values only surface strong matches.
                The default <strong className="text-neutral-600 dark:text-on-surface-variant">30%</strong> is a good balance for most users.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-white/[0.06]">
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="bg-neutral-900 hover:bg-neutral-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Preferences'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
