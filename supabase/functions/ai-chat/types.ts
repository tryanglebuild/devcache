// Type definitions for AI Chat Edge Function

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface SearchResult {
  resource_type: 'project_item' | 'agent_template' | 'file_attachment'
  resource_id: string
  name: string
  description: string | null
  tags: string[]
  content_preview: string | null
  relevance_score: number
}

export interface ChatRequest {
  sessionId: string
  message: string
  model?: string
  includeMarketplace?: boolean
}

export interface ChatSession {
  id: string
  user_id: string
  title: string
  context_type: 'general' | 'project' | 'marketplace'
  selected_model: string
  related_resource_ids: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  last_activity_at: string
}

export interface OpenRouterResponse {
  id: string
  model: string
  choices: Array<{
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface ModelConfig {
  id: string
  name: string
  provider: string
  costPer1MTokens: {
    input: number
    output: number
  }
}
