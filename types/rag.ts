// RAG System Types

export interface TemplateEmbedding {
  id: string
  agent_id: string
  embedding: number[]
  content_hash: string
  metadata: Record<string, any>
  indexed_at: string
}

export interface SearchResult {
  agent_id: string
  name: string
  description: string
  content: string
  tags: string[]
  category: string
  rating_average: number
  download_count: number
  user_id: string
  is_own_template: boolean
  is_favorite: boolean
  is_connection_template: boolean
  semantic_similarity: number
  priority_score: number
  quality_score: number
  final_score: number
  match_reason: string
}

export interface EmbeddingGenerateRequest {
  agent_id: string
}

export interface EmbeddingGenerateResponse {
  success: boolean
  agent_id: string
  tokens_used: number
}

export interface EmbeddingBatchRequest {
  limit?: number
}

export interface EmbeddingBatchResponse {
  success: boolean
  indexed: number
  total: number
  total_tokens: number
  results: Array<{
    agent_id: string
    name?: string
    success: boolean
    tokens?: number
    error?: string
  }>
}

export interface TemplateNeedingIndexing {
  agent_id: string
  name: string
  description: string
  content: string
  tags: string[]
  current_hash: string
}

export interface UserConnection {
  id: string
  user_id: string
  connected_user_id: string
  status: 'pending' | 'accepted' | 'rejected' | 'blocked'
  created_at: string
  updated_at: string
}
