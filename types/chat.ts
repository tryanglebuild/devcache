// Chat API type definitions

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

export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model_used: string | null
  tokens_input: number | null
  tokens_output: number | null
  cost_usd: number | null
  metadata: Record<string, any>
  created_at: string
}

export interface SearchResult {
  id: string
  message_id: string
  resource_type: 'project_item' | 'agent_template' | 'file_attachment'
  resource_id: string
  relevance_score: number
  matched_fields: Record<string, any>
  created_at: string
}

export interface UserModelPreferences {
  id: string
  user_id: string
  default_model: string
  favorite_models: string[]
  model_usage_stats: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ModelConfig {
  id: string
  name: string
  provider: string
  tier: 'budget' | 'balanced' | 'premium'
  speed: 'fast' | 'balanced' | 'slow'
  costPer1MTokens: {
    input: number
    output: number
  }
  contextWindow: number
  capabilities: string[]
  description: string
  bestFor: string[]
  creditMultiplier: number
  isFree: boolean
}

// API Request/Response types

export interface CreateSessionRequest {
  title: string
  context_type?: 'general' | 'project' | 'marketplace'
  selected_model?: string
}

export interface UpdateSessionRequest {
  title?: string
  selected_model?: string
  related_resource_ids?: string[]
}

export interface SendMessageRequest {
  sessionId: string
  message: string
  model?: string
  includeMarketplace?: boolean
}

export interface UpdatePreferencesRequest {
  default_model?: string
  favorite_models?: string[]
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}
