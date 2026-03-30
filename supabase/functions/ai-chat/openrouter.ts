// OpenRouter API client for streaming chat completions

import { ChatMessage, OpenRouterResponse } from './types.ts'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

export class OpenRouterClient {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async *streamChatCompletion(
    messages: ChatMessage[],
    model: string = 'anthropic/claude-3-haiku'
  ): AsyncGenerator<string> {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000',
        'X-Title': 'DevCache AI Chat',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('No response body')
    }

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(line => line.trim() !== '')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            if (data === '[DONE]') {
              return
            }

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              
              if (content) {
                yield content
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  async getChatCompletion(
    messages: ChatMessage[],
    model: string = 'anthropic/claude-3-haiku'
  ): Promise<OpenRouterResponse> {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000',
        'X-Title': 'DevCache AI Chat',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
    }

    return await response.json()
  }

  calculateCost(
    inputTokens: number,
    outputTokens: number,
    model: string
  ): number {
    // Cost per 1M tokens (in USD)
    const modelCosts: Record<string, { input: number; output: number }> = {
      'anthropic/claude-3-haiku': { input: 0.25, output: 1.25 },
      'anthropic/claude-3.5-sonnet': { input: 3, output: 15 },
      'anthropic/claude-3-opus': { input: 15, output: 75 },
      'openai/gpt-3.5-turbo': { input: 0.5, output: 1.5 },
      'openai/gpt-4-turbo': { input: 10, output: 30 },
      'openai/gpt-4': { input: 30, output: 60 },
      'meta-llama/llama-3-70b': { input: 0.5, output: 0.75 },
    }

    const costs = modelCosts[model] || { input: 1, output: 2 }
    
    const inputCost = (inputTokens / 1_000_000) * costs.input
    const outputCost = (outputTokens / 1_000_000) * costs.output
    
    return inputCost + outputCost
  }
}
