// TypeScript types for Skills System

export interface UserSkill {
  id: string
  user_id: string
  name: string
  description: string | null
  file_path: string
  file_size: number | null
  is_active: boolean
  priority: number
  category: 'general' | 'coding' | 'writing' | 'analysis' | 'custom'
  tags: string[]
  created_at: string
  updated_at: string
  last_used_at: string | null
}

export interface UserSkillEmbedding {
  id: string
  skill_id: string
  embedding_vector: number[] | null
  content_hash: string
  indexed_at: string
}

export interface CreateSkillRequest {
  name: string
  description?: string
  category?: UserSkill['category']
  tags?: string[]
  priority?: number
  content: string // For inline creation
}

export interface UpdateSkillRequest {
  name?: string
  description?: string
  category?: UserSkill['category']
  tags?: string[]
  priority?: number
  is_active?: boolean
}

export interface UploadSkillRequest {
  name: string
  description?: string
  category?: UserSkill['category']
  tags?: string[]
  priority?: number
  file: File
}

export interface SkillContentResponse {
  content: string
  name: string
  file_path: string
}

export interface SkillAnalytics {
  total_uses: number
  last_used: string | null
  activation_count: number
  view_count: number
  edit_count: number
}
