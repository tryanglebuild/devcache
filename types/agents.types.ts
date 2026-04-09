import { Database } from './database.types'

// Base types from database
export type AgentTemplate = Database['public']['Tables']['agent_templates']['Row']
export type AgentTemplateInsert = Database['public']['Tables']['agent_templates']['Insert']
export type AgentTemplateUpdate = Database['public']['Tables']['agent_templates']['Update']

export type AgentRating = Database['public']['Tables']['agent_ratings']['Row']
export type AgentRatingInsert = Database['public']['Tables']['agent_ratings']['Insert']
export type AgentRatingUpdate = Database['public']['Tables']['agent_ratings']['Update']

export type AgentDownload = Database['public']['Tables']['agent_downloads']['Row']
export type AgentDownloadInsert = Database['public']['Tables']['agent_downloads']['Insert']

export type AgentCollection = Database['public']['Tables']['agent_collections']['Row']
export type AgentCollectionInsert = Database['public']['Tables']['agent_collections']['Insert']
export type AgentCollectionUpdate = Database['public']['Tables']['agent_collections']['Update']

export type AgentExecution = Database['public']['Tables']['agent_executions']['Row']
export type AgentExecutionInsert = Database['public']['Tables']['agent_executions']['Insert']
export type AgentExecutionUpdate = Database['public']['Tables']['agent_executions']['Update']

// Extended types with relations
export type AgentTemplateWithAuthor = AgentTemplate & {
  author?: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
}

export type AgentTemplateWithStats = AgentTemplate & {
  author_name?: string
  is_in_collection?: boolean
  is_favorite?: boolean
  is_owned?: boolean
  user_rating?: number
  user_tags?: string[]
}

// Agent metadata structure (parsed from content frontmatter)
export interface AgentMetadata {
  name: string
  version: string
  author: string
  category: string
  tags: string[]
  rating?: number
  downloads?: number
  dependencies?: string[]
  visibility: 'public' | 'private'
}

// Agent content structure (parsed from markdown)
export interface AgentContent {
  metadata: AgentMetadata
  domainExpertise: string
  capabilities: string[]
  behavioralRules: string[]
  toolAccess: string[]
  decisionFramework: string
  exampleWorkflows: string[]
  knowledgeBase: string[]
}

// Search and filter types
export interface AgentSearchFilters {
  query?: string
  category?: string
  tags?: string[]
  minRating?: number
  sortBy?: 'rating' | 'downloads' | 'recent' | 'trending'
  visibility?: 'public' | 'private' | 'all'
  limit?: number
  offset?: number
}

export interface AgentSearchResult {
  id: string
  name: string
  description: string | null
  category: string
  tags: string[]
  rating_average: number
  rating_count: number
  download_count: number
  author_name: string | null
  created_at: string
}

// Stats types
export interface UserAgentStats {
  total_agents: number
  total_downloads: number
  total_executions: number
  average_rating: number
  total_reviews: number
}

export interface MarketplaceStats {
  total_agents: number
  total_creators: number
  total_downloads: number
  total_executions: number
  average_rating: number
}

// Execution types
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface ExecutionContext {
  prompt?: string
  parameters?: Record<string, any>
  projectContext?: string
  files?: string[]
}

export interface ExecutionResult {
  output?: string
  data?: any
  suggestions?: string[]
  errors?: string[]
}

// Category types
export type AgentCategory = 
  | 'backend'
  | 'frontend'
  | 'devops'
  | 'security'
  | 'testing'
  | 'database'
  | 'orchestrator'
  | 'general'

export const AGENT_CATEGORIES: Record<AgentCategory, { label: string; color: string; icon: string }> = {
  backend: {
    label: 'Backend',
    color: '#4f46e5',
    icon: 'dns'
  },
  frontend: {
    label: 'Frontend',
    color: '#575992',
    icon: 'web'
  },
  devops: {
    label: 'DevOps',
    color: '#10b981',
    icon: 'cloud'
  },
  security: {
    label: 'Security',
    color: '#ba1a1a',
    icon: 'shield'
  },
  testing: {
    label: 'Testing',
    color: '#904900',
    icon: 'bug_report'
  },
  database: {
    label: 'Database',
    color: '#6366f1',
    icon: 'storage'
  },
  orchestrator: {
    label: 'Orchestrator',
    color: '#8b5cf6',
    icon: 'hub'
  },
  general: {
    label: 'General',
    color: '#6b7280',
    icon: 'category'
  }
}
