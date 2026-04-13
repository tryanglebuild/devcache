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
import { Loader2, Sparkles, SlidersHorizontal } from 'lucide-react'
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
    <Card className="bg-white border-[#e5e7eb] shadow-sm">
      <CardHeader className="pb-6 border-b border-[#e5e7eb]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#4f46e5] flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-[#191c1e]">
              AI Model Preferences
            </CardTitle>
            <CardDescription className="text-[#6b7280] text-sm">
              Choose your default AI model for chat sessions
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="default_model" className="text-sm font-semibold text-[#191c1e]">
              Default AI Model
            </Label>
            <Select value={defaultModel} onValueChange={setDefaultModel}>
              <SelectTrigger className="border-[#e5e7eb] bg-white h-12 hover:border-[#4f46e5] transition-colors">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#e5e7eb] shadow-xl p-1 min-w-[500px]">
                {AI_MODELS.map((model) => (
                  <SelectItem 
                    key={model.id} 
                    value={model.id}
                    className="cursor-pointer rounded-md my-0.5 pl-3 pr-10 py-3 hover:bg-[#f7f9fb] data-[state=checked]:bg-[#eef0ff] data-[state=checked]:border-l-2 data-[state=checked]:border-[#4f46e5] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-6 w-full pr-2">
                      {/* Left: Model Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-[#191c1e]">
                            {model.name}
                          </span>
                          <span className="px-2 py-0.5 bg-white rounded text-[10px] font-medium text-[#6b7280] border border-[#e5e7eb]">
                            {model.provider}
                          </span>
                        </div>
                        <p className="text-xs text-[#6b7280] truncate">
                          {model.description}
                        </p>
                      </div>
                      
                      {/* Right: Metrics */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="text-xs font-semibold text-[#4f46e5]">
                            {model.costMultiplier}x
                          </div>
                          <div className="text-[10px] text-[#9ca3af]">cost</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-semibold text-[#191c1e]">
                            {model.contextWindow.split(' ')[0]}
                          </div>
                          <div className="text-[10px] text-[#9ca3af]">tokens</div>
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-[#464554]">
              This model will be used by default in new chat sessions
            </p>
          </div>

          {/* Selected Model Details */}
          {defaultModel && (() => {
            const selectedModel = AI_MODELS.find(m => m.id === defaultModel)
            if (!selectedModel) return null
            
            return (
              <div className="space-y-4">
                {/* Model Header - Clean & Professional */}
                <div className="p-5 bg-white border-2 border-[#4f46e5] rounded-lg shadow-md relative">
                  {/* Selected Badge */}
                  <div className="absolute -top-3 right-4 px-3 py-1 bg-[#4f46e5] rounded-full shadow-sm">
                    <span className="text-xs font-semibold text-white">Selected</span>
                  </div>
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-bold text-[#191c1e]">
                          {selectedModel.name}
                        </h4>
                        <span className="px-2.5 py-0.5 bg-[#f7f9fb] rounded text-xs font-medium text-[#464554] border border-[#e5e7eb]">
                          {selectedModel.provider}
                        </span>
                      </div>
                      <p className="text-sm text-[#464554]">
                        {selectedModel.description}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#e5e7eb]">
                    <p className="text-xs text-[#6b7280] leading-relaxed">
                      <span className="font-semibold text-[#191c1e]">Best for:</span> {selectedModel.bestFor}
                    </p>
                  </div>
                </div>

                {/* Cost & Technical Details Grid - Professional Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cost Multiplier */}
                  <div className="p-5 bg-white border border-[#e5e7eb] rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                        Cost Multiplier
                      </span>
                      <div className="w-6 h-6 rounded bg-[#f7f9fb] flex items-center justify-center">
                        <span className="text-[#4f46e5] text-xs">$</span>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="text-3xl font-bold text-[#191c1e]">
                        {selectedModel.costMultiplier}x
                      </span>
                      <span className="text-sm text-[#6b7280]">base rate</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${
                        selectedModel.costMultiplier <= 1 
                          ? 'bg-green-500' 
                          : selectedModel.costMultiplier <= 5 
                          ? 'bg-blue-500' 
                          : 'bg-orange-500'
                      }`} />
                      <span className="text-xs text-[#6b7280]">
                        {selectedModel.costMultiplier <= 1 
                          ? 'Most economical' 
                          : selectedModel.costMultiplier <= 5 
                          ? 'Moderate pricing' 
                          : 'Premium tier'}
                      </span>
                    </div>
                  </div>

                  {/* Context Window */}
                  <div className="p-5 bg-white border border-[#e5e7eb] rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                        Context Window
                      </span>
                      <div className="w-6 h-6 rounded bg-[#f7f9fb] flex items-center justify-center">
                        <span className="text-[#4f46e5] text-xs">⚡</span>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="text-3xl font-bold text-[#191c1e]">
                        {selectedModel.contextWindow.split(' ')[0]}
                      </span>
                      <span className="text-sm text-[#6b7280]">
                        {selectedModel.contextWindow.split(' ')[1]}
                      </span>
                    </div>
                    <span className="text-xs text-[#6b7280]">
                      Maximum conversation length
                    </span>
                  </div>
                </div>

                {/* Strengths - Clean List */}
                <div className="p-5 bg-white border border-[#e5e7eb] rounded-lg shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                      Key Capabilities
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedModel.strengths.map((strength, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1.5 bg-[#f7f9fb] rounded-md text-xs font-medium text-[#191c1e] border border-[#e5e7eb]"
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
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#f0f0ff] flex items-center justify-center shrink-0">
                <SlidersHorizontal className="h-4 w-4 text-[#4f46e5]" />
              </div>
              <div>
                <Label className="text-sm font-semibold text-[#191c1e]">
                  Search Relevance Threshold
                </Label>
                <p className="text-xs text-[#6b7280]">
                  Controls how closely results must match your query before being shown in chat
                </p>
              </div>
            </div>

            <div className="p-5 bg-white border border-[#e5e7eb] rounded-lg shadow-sm space-y-4">
              {/* Labels row */}
              <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">
                <span>Broad</span>
                <span>Balanced</span>
                <span>Strict</span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #4f46e5 ${threshold * 100}%, #e5e7eb ${threshold * 100}%)`,
                }}
              />

              {/* Current value + description */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[#191c1e]">
                    {Math.round(threshold * 100)}%
                  </span>
                  <span className="text-xs text-[#6b7280]">
                    minimum match
                  </span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  threshold <= 0.2
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : threshold <= 0.5
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : threshold <= 0.75
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {threshold <= 0.2
                    ? 'Broad — shows many results'
                    : threshold <= 0.5
                    ? 'Balanced — recommended'
                    : threshold <= 0.75
                    ? 'Focused — high precision'
                    : 'Strict — only exact matches'}
                </span>
              </div>

              <p className="text-xs text-[#6b7280] leading-relaxed border-t border-[#e5e7eb] pt-3">
                <span className="font-semibold text-[#191c1e]">How it works: </span>
                The AI chat searches your projects and marketplace agents. Lower values return more
                results (including loosely related ones); higher values only surface strong matches.
                The default <strong>30%</strong> is a good balance for most users.
              </p>
            </div>
          </div>

          {/* Model Info Card */}
          <div className="p-5 bg-[#f7f9fb] border border-[#e5e7eb] rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-white border border-[#e5e7eb] flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-[#4f46e5]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#191c1e] mb-1">
                  About AI Models
                </h4>
                <p className="text-xs text-[#6b7280] leading-relaxed">
                  Different models have different capabilities and costs. Haiku is fastest and most affordable, 
                  while Opus provides the most advanced reasoning. You can change the model for individual 
                  chat sessions at any time.
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-[#e5e7eb]">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#4f46e5] hover:bg-[#3739b8] text-white font-semibold shadow-sm hover:shadow-md transition-all px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
