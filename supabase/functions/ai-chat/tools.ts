// AI Tools for Function Calling
// These tools allow the AI to execute actions on the platform

export interface Tool {
  name: string
  description: string
  parameters: {
    type: string
    properties: Record<string, any>
    required: string[]
  }
}

export interface ToolCall {
  name: string
  arguments: Record<string, any>
}

export interface ToolResult {
  success: boolean
  data?: any
  error?: string
}

// Define available tools
export const AVAILABLE_TOOLS: Tool[] = [
  {
    name: 'search_user_projects',
    description: 'Search through user\'s personal projects, folders, and files. Use this when the user asks about their own code or projects.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query to find relevant projects/files'
        },
        type: {
          type: 'string',
          enum: ['all', 'folder', 'file'],
          description: 'Filter by resource type'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 5)',
          default: 5
        }
      },
      required: ['query']
    }
  },
  {
    name: 'search_marketplace_templates',
    description: 'Search marketplace for public templates and code snippets. Use this when the user is looking for examples or community resources.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for marketplace templates'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by specific tags'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 5)',
          default: 5
        }
      },
      required: ['query']
    }
  },
  {
    name: 'get_project_details',
    description: 'Get detailed information about a specific project folder or file, including full content.',
    parameters: {
      type: 'object',
      properties: {
        resource_id: {
          type: 'string',
          description: 'The ID of the project resource'
        },
        resource_type: {
          type: 'string',
          enum: ['folder', 'file'],
          description: 'Type of resource'
        }
      },
      required: ['resource_id', 'resource_type']
    }
  },
  {
    name: 'get_template_details',
    description: 'Get detailed information about a marketplace template, including full content and metadata.',
    parameters: {
      type: 'object',
      properties: {
        template_id: {
          type: 'string',
          description: 'The ID of the template'
        }
      },
      required: ['template_id']
    }
  },
  {
    name: 'list_user_tags',
    description: 'List all tags used by the user in their projects. Useful for understanding user\'s organization system.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_user_stats',
    description: 'Get statistics about user\'s activity: total projects, templates, recent activity, etc.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'create_quick_note',
    description: 'Create a quick note/snippet for the user based on conversation. Use when user asks to "save this" or "remember that".',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title for the note'
        },
        content: {
          type: 'string',
          description: 'Content of the note'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags to organize the note'
        }
      },
      required: ['title', 'content']
    }
  }
]

// Tool execution functions
export class ToolExecutor {
  constructor(private supabaseClient: any, private userId: string) {}

  async execute(toolCall: ToolCall): Promise<ToolResult> {
    try {
      switch (toolCall.name) {
        case 'search_user_projects':
          return await this.searchUserProjects(toolCall.arguments)
        
        case 'search_marketplace_templates':
          return await this.searchMarketplaceTemplates(toolCall.arguments)
        
        case 'get_project_details':
          return await this.getProjectDetails(toolCall.arguments)
        
        case 'get_template_details':
          return await this.getTemplateDetails(toolCall.arguments)
        
        case 'list_user_tags':
          return await this.listUserTags()
        
        case 'get_user_stats':
          return await this.getUserStats()
        
        case 'create_quick_note':
          return await this.createQuickNote(toolCall.arguments)
        
        default:
          return {
            success: false,
            error: `Unknown tool: ${toolCall.name}`
          }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  private async searchUserProjects(args: any): Promise<ToolResult> {
    const { query, type = 'all', limit = 5 } = args

    let queryBuilder = this.supabaseClient
      .from('project_items')
      .select('id, name, description, type, tags, content_preview, folder_id')
      .eq('user_id', this.userId)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(limit)

    if (type !== 'all') {
      queryBuilder = queryBuilder.eq('type', type)
    }

    const { data, error } = await queryBuilder

    if (error) throw error

    return {
      success: true,
      data: {
        results: data,
        count: data?.length || 0
      }
    }
  }

  private async searchMarketplaceTemplates(args: any): Promise<ToolResult> {
    const { query, tags, limit = 5 } = args

    let queryBuilder = this.supabaseClient
      .from('agent_templates')
      .select('id, name, description, tags, category, downloads_count, is_featured')
      .eq('is_published', true)
      .eq('is_deleted', false)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit)

    if (tags && tags.length > 0) {
      queryBuilder = queryBuilder.contains('tags', tags)
    }

    const { data, error } = await queryBuilder.order('downloads_count', { ascending: false })

    if (error) throw error

    return {
      success: true,
      data: {
        results: data,
        count: data?.length || 0
      }
    }
  }

  private async getProjectDetails(args: any): Promise<ToolResult> {
    const { resource_id, resource_type } = args

    const { data, error } = await this.supabaseClient
      .from('project_items')
      .select('*')
      .eq('id', resource_id)
      .eq('user_id', this.userId)
      .eq('type', resource_type)
      .single()

    if (error) throw error

    return {
      success: true,
      data
    }
  }

  private async getTemplateDetails(args: any): Promise<ToolResult> {
    const { template_id } = args

    const { data, error } = await this.supabaseClient
      .from('agent_templates')
      .select('*')
      .eq('id', template_id)
      .eq('is_published', true)
      .eq('is_deleted', false)
      .single()

    if (error) throw error

    return {
      success: true,
      data
    }
  }

  private async listUserTags(): Promise<ToolResult> {
    const { data, error } = await this.supabaseClient
      .rpc('get_user_tags', { p_user_id: this.userId })

    if (error) throw error

    return {
      success: true,
      data: {
        tags: data || []
      }
    }
  }

  private async getUserStats(): Promise<ToolResult> {
    // Get project counts
    const { count: projectCount } = await this.supabaseClient
      .from('project_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', this.userId)

    // Get template counts
    const { count: templateCount } = await this.supabaseClient
      .from('agent_templates')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', this.userId)
      .eq('is_deleted', false)

    // Get recent activity
    const { data: recentProjects } = await this.supabaseClient
      .from('project_items')
      .select('name, type, updated_at')
      .eq('user_id', this.userId)
      .order('updated_at', { ascending: false })
      .limit(5)

    return {
      success: true,
      data: {
        total_projects: projectCount || 0,
        total_templates: templateCount || 0,
        recent_activity: recentProjects || []
      }
    }
  }

  private async createQuickNote(args: any): Promise<ToolResult> {
    const { title, content, tags = [] } = args

    const { data, error } = await this.supabaseClient
      .from('project_items')
      .insert({
        user_id: this.userId,
        name: title,
        description: `Quick note created by AI assistant`,
        content: content,
        type: 'file',
        tags: tags,
        language: 'markdown'
      })
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      data: {
        message: 'Note created successfully',
        note_id: data.id,
        note: data
      }
    }
  }
}
