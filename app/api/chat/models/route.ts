// Available AI Models API

import { NextResponse } from 'next/server'
import type { ModelConfig } from '@/types/chat'

const AVAILABLE_MODELS: ModelConfig[] = [
  // FREE MODELS (1x credits)
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    tier: 'budget',
    speed: 'fast',
    costPer1MTokens: { input: 0.25, output: 1.25 },
    contextWindow: 200000,
    capabilities: ['text', 'code', 'analysis'],
    description: 'Fast and economical for most tasks',
    bestFor: ['Quick queries', 'Code snippets', 'General assistance'],
    creditMultiplier: 1,
    isFree: true,
  },
  {
    id: 'openai/gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    tier: 'budget',
    speed: 'fast',
    costPer1MTokens: { input: 0.5, output: 1.5 },
    contextWindow: 16385,
    capabilities: ['text', 'code'],
    description: 'Fast and affordable OpenAI model',
    bestFor: ['Quick responses', 'Simple tasks', 'Code completion'],
    creditMultiplier: 1,
    isFree: true,
  },
  {
    id: 'meta-llama/llama-3-70b',
    name: 'Llama 3 70B',
    provider: 'Meta',
    tier: 'budget',
    speed: 'fast',
    costPer1MTokens: { input: 0.5, output: 0.75 },
    contextWindow: 8192,
    capabilities: ['text', 'code'],
    description: 'Open-source model with good performance',
    bestFor: ['General tasks', 'Code generation', 'Cost-effective usage'],
    creditMultiplier: 1,
    isFree: true,
  },
  
  // PREMIUM MODELS (1.5x - 3x credits)
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    tier: 'balanced',
    speed: 'balanced',
    costPer1MTokens: { input: 3, output: 15 },
    contextWindow: 200000,
    capabilities: ['text', 'code', 'analysis', 'reasoning'],
    description: 'Best balance of quality and speed',
    bestFor: ['Complex queries', 'Code review', 'Detailed analysis'],
    creditMultiplier: 1.5,
    isFree: false,
  },
  {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    tier: 'balanced',
    speed: 'balanced',
    costPer1MTokens: { input: 10, output: 30 },
    contextWindow: 128000,
    capabilities: ['text', 'code', 'analysis', 'reasoning'],
    description: 'Powerful and versatile GPT-4 model',
    bestFor: ['Complex tasks', 'Long context', 'Detailed analysis'],
    creditMultiplier: 2,
    isFree: false,
  },
  {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    tier: 'premium',
    speed: 'slow',
    costPer1MTokens: { input: 15, output: 75 },
    contextWindow: 200000,
    capabilities: ['text', 'code', 'analysis', 'reasoning', 'creative'],
    description: 'Maximum quality for complex tasks',
    bestFor: ['Complex reasoning', 'Creative writing', 'Advanced analysis'],
    creditMultiplier: 3,
    isFree: false,
  },
  {
    id: 'openai/gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    tier: 'premium',
    speed: 'slow',
    costPer1MTokens: { input: 30, output: 60 },
    contextWindow: 8192,
    capabilities: ['text', 'code', 'analysis', 'reasoning'],
    description: 'Original GPT-4 with maximum quality',
    bestFor: ['Critical tasks', 'High accuracy needs', 'Complex reasoning'],
    creditMultiplier: 2.5,
    isFree: false,
  },
]

// GET /api/chat/models - Get list of available AI models
export async function GET() {
  try {
    return NextResponse.json({ data: AVAILABLE_MODELS })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
