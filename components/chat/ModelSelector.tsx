'use client'

import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getModels } from '@/lib/chat-api'
import type { ModelConfig } from '@/types/chat'
import { Sparkles, Zap, DollarSign } from 'lucide-react'

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (model: string) => void
  disabled?: boolean
}

export function ModelSelector({ selectedModel, onModelChange, disabled }: ModelSelectorProps) {
  const [models, setModels] = useState<ModelConfig[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadModels()
  }, [])

  async function loadModels() {
    try {
      const data = await getModels()
      setModels(data)
    } catch (error) {
      console.error('Failed to load models:', error)
    } finally {
      setLoading(false)
    }
  }

  function getTierIcon(tier: string) {
    switch (tier) {
      case 'budget':
        return <DollarSign className="h-4 w-4" />
      case 'balanced':
        return <Zap className="h-4 w-4" />
      case 'premium':
        return <Sparkles className="h-4 w-4" />
      default:
        return null
    }
  }

  function getTierLabel(tier: string) {
    switch (tier) {
      case 'budget':
        return 'Budget'
      case 'balanced':
        return 'Balanced'
      case 'premium':
        return 'Premium'
      default:
        return tier
    }
  }

  const groupedModels = models.reduce((acc, model) => {
    const key = model.isFree ? 'free' : 'premium'
    if (!acc[key]) acc[key] = []
    acc[key].push(model)
    return acc
  }, {} as Record<string, ModelConfig[]>)

  const selectedModelData = models.find(m => m.id === selectedModel)

  return (
    <Select value={selectedModel} onValueChange={onModelChange} disabled={disabled || loading}>
      <SelectTrigger className="w-[240px] border-[#e0e3e5]">
        <SelectValue>
          {selectedModelData ? (
            <div className="flex items-center gap-2">
              {getTierIcon(selectedModelData.tier)}
              <span className="text-sm">{selectedModelData.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f2f4f6] text-[#464554] font-mono">
                {selectedModelData.creditMultiplier}x
              </span>
            </div>
          ) : (
            'Select model...'
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {/* Free Models */}
        {groupedModels.free && groupedModels.free.length > 0 && (
          <SelectGroup>
            <SelectLabel className="flex items-center gap-2 text-[#10b981]">
              <Zap className="h-3 w-3" />
              Free Models (1x credits)
            </SelectLabel>
            {groupedModels.free.map(model => (
              <SelectItem key={model.id} value={model.id} className="cursor-pointer">
                <div className="flex items-center gap-2 w-full">
                  <span className="font-medium">{model.name}</span>
                  <span className="text-xs text-muted-foreground">({model.provider})</span>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[#10b981]/10 text-[#10b981] font-bold">
                    {model.creditMultiplier}x
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}

        {/* Premium Models */}
        {groupedModels.premium && groupedModels.premium.length > 0 && (
          <SelectGroup>
            <SelectLabel className="flex items-center gap-2 text-[#4648d4]">
              <Sparkles className="h-3 w-3" />
              Premium Models
            </SelectLabel>
            {groupedModels.premium.map(model => (
              <SelectItem key={model.id} value={model.id} className="cursor-pointer">
                <div className="flex items-center gap-2 w-full">
                  <span className="font-medium">{model.name}</span>
                  <span className="text-xs text-muted-foreground">({model.provider})</span>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[#4648d4]/10 text-[#4648d4] font-bold">
                    {model.creditMultiplier}x
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  )
}
