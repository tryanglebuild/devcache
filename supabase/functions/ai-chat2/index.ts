// AI Chat Edge Function v2 - Clean Architecture with AI Tools
// Based on Context Engine pattern with OpenAI-compatible tool calling

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

// ── CORS Headers ──────────────────────────────────────────────────────────────

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// ── Configuration ─────────────────────────────────────────────────────────────

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
const DEFAULT_MODEL = "anthropic/claude-3.5-sonnet"
const MAX_ITER = 5 // Maximum tool call iterations to prevent infinite loops

// ── System Prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an intelligent AI assistant for a Personal Knowledge Management (PKM) platform. Your role is to help users manage their projects, code snippets, templates, and knowledge base effectively.

## Core Capabilities

You have access to powerful tools that allow you to:
- **Search & Retrieve**: Find user's projects, files, and marketplace templates
- **Analyze**: Get detailed information about specific resources
- **Organize**: List tags and understand user's organization system
- **Create**: Save quick notes and snippets for the user
- **Insights**: Provide statistics and activity summaries

## Operating Principles

1. **Tool-First Approach**: When a user asks about their projects, templates, or wants to find something, ALWAYS use the appropriate tools first before responding. Don't guess or hallucinate information.

2. **Language Matching**: CRITICAL - Always respond in the same language as the user's message:
   - If user writes in Portuguese → Respond in Portuguese
   - If user writes in English → Respond in English
   - Detect language switches immediately and adapt

3. **Concise & Actionable**: Provide clear, direct answers. Avoid unnecessary explanations unless asked.

4. **Context-Aware**: Use the conversation history and user stats to provide personalized responses.

5. **Proactive Tool Usage**: 
   - User asks "what projects do I have?" → Use search_user_projects
   - User asks "find templates about X" → Use search_marketplace_templates
   - User says "save this" → Use create_quick_note
   - User asks "show me details" → Use get_project_details or get_template_details

## Tool Usage Guidelines

- **search_user_projects**: Use when user asks about their own code, projects, files, or folders
- **search_marketplace_templates**: Use when user looks for examples, community resources, or public templates
- **get_project_details**: Use when user wants full content or details of a specific project resource
- **get_template_details**: Use when user wants full details of a marketplace template
- **list_user_tags**: Use when user asks about their tags or organization system
- **get_user_stats**: Use when user asks about their activity, statistics, or overview
- **create_quick_note**: Use when user asks to save, remember, or store something

## Response Style

- **Direct**: Get to the point quickly
- **Helpful**: Anticipate user needs
- **Organized**: Use bullet points and clear structure when presenting multiple items
- **Friendly**: Be warm and supportive, but professional
- **Accurate**: Only present information from tool results, never make up data

## When Tools Return Empty Results

If a search returns no results:
- Acknowledge it clearly: "I couldn't find any projects matching that query"
- Suggest alternatives: "Try searching with different keywords" or "Would you like to search the marketplace instead?"
- Offer to help create: "Would you like me to create a note about this?"

## Conversation Flow

1. Understand user intent
2. Use appropriate tools to gather information
3. Present results in a clear, organized manner
4. Offer next steps or related actions

Remember: You are a knowledgeable assistant that helps users manage their knowledge effectively. Be proactive with tools, accurate with information, and always match the user's language.`

// ── Tool Definitions (OpenAI Format) ──────────────────────────────────────────

interface Tool {
  type: string
  function: {
    name: string
    description: string
    parameters: Record<string, any>
  }
}

function tool(
  name: string,
  description: string,
  parameters: Record<string, any>
): Tool {
  return {
    type: "function",
    function: { name, description, parameters }
  }
}

const TOOLS: Tool[] = [
  tool(
    "search_user_projects",
    "Search through user's personal projects, folders, and files. Use this when the user asks about their own code or projects.",
    {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query to find relevant projects/files"
        },
        type: {
          type: "string",
          enum: ["all", "folder", "file"],
          description: "Filter by resource type (default: all)"
        },
        limit: {
          type: "number",
          description: "Maximum number of results (default: 5, max: 20)",
          default: 5
        }
      },
      required: ["query"]
    }
  ),

  tool(
    "search_marketplace_templates",
    "Search marketplace for public templates and code snippets. Use this when the user is looking for examples or community resources.",
    {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query for marketplace templates"
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Filter by specific tags (optional)"
        },
        limit: {
          type: "number",
          description: "Maximum number of results (default: 5, max: 20)",
          default: 5
        }
      },
      required: ["query"]
    }
  ),

  tool(
    "get_project_details",
    "Get detailed information about a specific project folder or file, including full content.",
    {
      type: "object",
      properties: {
        resource_id: {
          type: "string",
          description: "The UUID of the project resource"
        },
        resource_type: {
          type: "string",
          enum: ["folder", "file"],
          description: "Type of resource"
        }
      },
      required: ["resource_id", "resource_type"]
    }
  ),

  tool(
    "get_template_details",
    "Get detailed information about a marketplace template, including full content and metadata.",
    {
      type: "object",
      properties: {
        template_id: {
          type: "string",
          description: "The UUID of the template"
        }
      },
      required: ["template_id"]
    }
  ),

  tool(
    "list_user_tags",
    "List all tags used by the user in their projects. Useful for understanding user's organization system.",
    {
      type: "object",
      properties: {},
      required: []
    }
  ),

  tool(
    "get_user_stats",
    "Get statistics about user's activity: total projects, templates, recent activity, etc.",
    {
      type: "object",
      properties: {},
      required: []
    }
  ),

  tool(
    "create_quick_note",
    "Create a quick note/snippet for the user based on conversation. Use when user asks to 'save this' or 'remember that'.",
    {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Title for the note"
        },
        content: {
          type: "string",
          description: "Content of the note (can be markdown)"
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Tags to organize the note (optional)"
        }
      },
      required: ["title", "content"]
    }
  )
]

// ── Helper Functions ──────────────────────────────────────────────────────────

function makeSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )
}

// Detect user language from message
function detectLanguage(message: string): string {
  const ptIndicators = [
    'você', 'voce', 'está', 'esta', 'são', 'sao', 'não', 'nao',
    'também', 'tambem', 'então', 'entao', 'algum', 'alguma',
    'preciso', 'quero', 'gostaria', 'poderia', 'fazer', 'criar',
    'tem', 'tenho', 'vamos', 'para', 'com', 'uma', 'projeto',
    'existe', 'sobre', 'como', 'onde', 'quando', 'porque', 'porquê',
    'qual', 'quais', 'meu', 'minha', 'meus', 'minhas'
  ]
  
  const lowerMessage = message.toLowerCase()
  const ptMatches = ptIndicators.filter(indicator => 
    lowerMessage.includes(indicator)
  ).length
  
  return ptMatches >= 1 ? 'pt-BR' : 'en'
}

// Load active skills for user
async function loadActiveSkills(
  supabase: ReturnType<typeof makeSupabase>,
  userId: string
): Promise<string> {
  try {
    const { data: skills, error } = await supabase
      .from('user_skills')
      .select('id, name, description, file_path, priority, category')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })

    if (error || !skills || skills.length === 0) {
      return ''
    }

    const skillContents = await Promise.all(
      skills.map(async (skill: any) => {
        try {
          const { data: fileData } = await supabase.storage
            .from('user-skills')
            .download(skill.file_path)

          if (!fileData) return null

          const content = await fileData.text()
          
          // Mark skill as used
          await supabase.rpc('mark_skill_as_used', { p_skill_id: skill.id })

          return {
            name: skill.name,
            description: skill.description,
            category: skill.category,
            priority: skill.priority,
            content: content.trim(),
          }
        } catch (err) {
          console.error(`Failed to load skill ${skill.name}:`, err)
          return null
        }
      })
    )

    const validSkills = skillContents.filter(s => s !== null)

    if (validSkills.length === 0) {
      return ''
    }

    const skillsSection = validSkills
      .map((skill: any, idx: number) => {
        return `
### SKILL ${idx + 1}: ${skill.name} (Priority: ${skill.priority}, Category: ${skill.category})
${skill.description ? `Description: ${skill.description}\n` : ''}
${skill.content}
`.trim()
      })
      .join('\n\n---\n\n')

    return `
# USER-DEFINED SKILLS AND INSTRUCTIONS

The user has defined the following custom skills/instructions that you MUST follow:

${skillsSection}

IMPORTANT: These user-defined skills take precedence over general instructions. Follow them carefully.
`.trim()
  } catch (error) {
    console.error('Error loading skills:', error)
    return ''
  }
}

// Generate embedding for RAG search
async function generateEmbedding(text: string, apiKey: string): Promise<number[] | null> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get("APP_URL") || "https://kiro-agent.com",
      },
      body: JSON.stringify({
        model: 'openai/text-embedding-ada-002',
        input: text,
      }),
    })

    if (!response.ok) {
      console.error('Embedding generation failed:', await response.text())
      return null
    }

    const data = await response.json()
    return data.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    return null
  }
}

// Post-process AI response to inject resource tags if missing
function injectResourceTags(
  aiResponse: string,
  ragResults: any[],
  userLanguage: string
): string {
  // Check if AI already used resource tags
  const hasResourceTags = /\[(FILE|FOLDER|TEMPLATE):[a-f0-9-]+:.+\]/i.test(aiResponse)

  if (hasResourceTags || ragResults.length === 0) {
    return aiResponse // AI already formatted correctly or no resources
  }

  // Do NOT inject if the AI explicitly said ABSOLUTELY nothing was found (end of response)
  // Be careful: partial sentences like "não encontrei nos seus projetos" should NOT block
  // injection if there ARE marketplace results. Only skip if the full response is negative.
  const notFoundPatterns = [
    /não encontrei nenhum/i,
    /nenhum (arquivo|ficheiro|documento|recurso|resultado|template) (foi|encontrado|disponível)/i,
    /no (files?|documents?|resources?|templates?|results?) (were )?found/i,
    /nothing (was )?found/i,
    /sem (arquivos|ficheiros|documentos|recursos|resultados)/i,
  ]
  const aiSaysNotFound = notFoundPatterns.some(p => p.test(aiResponse))
  if (aiSaysNotFound) {
    console.log('ℹ️ AI indicated nothing was found — skipping resource tag injection')
    return aiResponse
  }

  // Only inject results that have a meaningful relevance score
  const MIN_INJECT_SCORE = 1.0
  const relevantResults = ragResults.filter((r: any) =>
    r.relevance_score !== undefined ? r.relevance_score >= MIN_INJECT_SCORE : true
  )

  if (relevantResults.length === 0) {
    console.log('ℹ️ No results meet the minimum relevance threshold — skipping injection')
    return aiResponse
  }

  console.log(`⚠️ AI did not use resource tags, injecting ${relevantResults.length} relevant resource(s)...`)

  // Build resource tags section
  const intro = userLanguage === 'pt-BR'
    ? `Encontrei ${relevantResults.length} recurso(s) relevante(s) na sua base de conhecimento:\n\n`
    : `I found ${relevantResults.length} relevant resource(s) in your knowledge base:\n\n`

  let resourceTags = ''
  relevantResults.forEach((r: any) => {
    const tagType = r.resource_type === 'project_folder' ? 'FOLDER' :
                    r.resource_type === 'marketplace_template' ? 'TEMPLATE' : 'FILE'
    resourceTags += `[${tagType}:${r.resource_id}:${r.name}]\n`
  })

  const separator = '\n---\n\n'

  // Inject at the beginning of response
  return `${intro}${resourceTags}${separator}${aiResponse}`
}

// Build enhanced system prompt with context
function buildEnhancedSystemPrompt(options: {
  userLanguage: string
  userStats?: any
  activeSkills: string
  contextResults: any[]
}): string {
  const { userLanguage, userStats, activeSkills, contextResults } = options

  let enhancedPrompt = SYSTEM_PROMPT

  // Add language instruction
  enhancedPrompt += `\n\n## User Language\n\nThe user is currently communicating in: ${userLanguage === 'pt-BR' ? 'Portuguese (Brazil)' : 'English'}\nYou MUST respond in ${userLanguage === 'pt-BR' ? 'Portuguese' : 'English'}.`

  // Add user stats if available
  if (userStats) {
    enhancedPrompt += `\n\n## User Context\n\n`
    enhancedPrompt += `- Total Projects: ${userStats.total_projects || 0}\n`
    enhancedPrompt += `- Total Templates: ${userStats.total_templates || 0}\n`
    
    if (userStats.recent_activity && userStats.recent_activity.length > 0) {
      enhancedPrompt += `- Recent Activity: ${userStats.recent_activity.length} recent items\n`
    }
  }

  // Add RAG search results (CRITICAL for recommendations)
  if (contextResults.length > 0) {
    enhancedPrompt += `\n\n## Available Resources (Search Results)\n\n`
    enhancedPrompt += `Based on the user's query, here are the most relevant resources from their knowledge base:\n\n`
    
    // Separate high relevance from low relevance
    const highRelevance = contextResults.filter((r: any) => r.relevance_score >= 1.5)
    const lowRelevance = contextResults.filter((r: any) => r.relevance_score < 1.5)
    
    if (highRelevance.length > 0) {
      enhancedPrompt += `### High Relevance Resources (${highRelevance.length}):\n\n`
      highRelevance.forEach((result: any, idx: number) => {
        const relevancePercent = (result.relevance_score * 100).toFixed(0)
        const similarityPercent = result.similarity_score ? (result.similarity_score * 100).toFixed(0) : 'N/A'
        
        enhancedPrompt += `${idx + 1}. **${result.name}** (${result.resource_type})\n`
        enhancedPrompt += `   - Description: ${result.description || 'No description available'}\n`
        enhancedPrompt += `   - Relevance: ${relevancePercent}% | Similarity: ${similarityPercent}%\n`
        
        if (result.tags && result.tags.length > 0) {
          enhancedPrompt += `   - Tags: ${result.tags.join(', ')}\n`
        }
        
        enhancedPrompt += `   - ID: ${result.resource_id}\n\n`
      })
    }
    
    if (lowRelevance.length > 0) {
      enhancedPrompt += `\n### Lower Relevance Resources (${lowRelevance.length}):\n\n`
      lowRelevance.forEach((result: any, idx: number) => {
        const relevancePercent = (result.relevance_score * 100).toFixed(0)
        const similarityPercent = result.similarity_score ? (result.similarity_score * 100).toFixed(0) : 'N/A'
        
        enhancedPrompt += `${idx + 1}. **${result.name}** (${result.resource_type})\n`
        enhancedPrompt += `   - Description: ${result.description || 'No description available'}\n`
        enhancedPrompt += `   - Relevance: ${relevancePercent}% | Similarity: ${similarityPercent}%\n`
        
        if (result.tags && result.tags.length > 0) {
          enhancedPrompt += `   - Tags: ${result.tags.join(', ')}\n`
        }
        
        enhancedPrompt += `   - ID: ${result.resource_id}\n\n`
      })
    }

    enhancedPrompt += `\n**CRITICAL INSTRUCTIONS FOR USING THESE RESOURCES**:\n\n`
    enhancedPrompt += `1. **These results already include BOTH personal projects AND public marketplace templates** — do NOT call any search tool again, the search is already done\n`
    enhancedPrompt += `2. **ALWAYS analyze ALL resources listed above** — even lower-relevance ones may be exactly what the user needs\n`
    enhancedPrompt += `3. **Distinguish the source clearly** for marketplace templates: say "Encontrei no marketplace público:" (or "Found in public marketplace:")\n`
    enhancedPrompt += `4. **Start your response by listing the found resources**:\n`
    enhancedPrompt += `   - Example PT: "Encontrei ${contextResults.length} recurso(s) sobre esse tema:"\n`
    enhancedPrompt += `   - Example EN: "I found ${contextResults.length} resource(s) about this topic:"\n`
    enhancedPrompt += `5. **Use special tags to create interactive cards** for each relevant resource:\n`
    enhancedPrompt += `   - For project files: [FILE:resource_id:file_name]\n`
    enhancedPrompt += `   - For project folders: [FOLDER:resource_id:folder_name]\n`
    enhancedPrompt += `   - For marketplace templates: [TEMPLATE:resource_id:template_name]\n`
    enhancedPrompt += `6. **Format example**:\n`
    enhancedPrompt += `   "Encontrei recursos relevantes:\n\n`
    
    // Show example with actual resources
    const exampleResources = contextResults.slice(0, 2)
    exampleResources.forEach((r: any) => {
      const tagType = r.resource_type === 'project_folder' ? 'FOLDER' : 
                      r.resource_type === 'marketplace_template' ? 'TEMPLATE' : 'FILE'
      enhancedPrompt += `   [${tagType}:${r.resource_id}:${r.name}]\n`
    })
    
    enhancedPrompt += `\n   Estes recursos contêm [explicar relevância]..."\n\n`
    enhancedPrompt += `7. **IMPORTANT**: Place the tags on their own lines for better formatting\n`
    enhancedPrompt += `8. **After listing resources**, provide your detailed answer based on their content\n`
    enhancedPrompt += `9. **Offer to show details**: "Clique em qualquer card acima para ver o conteúdo completo"\n\n`
    
    // Add Few-Shot Examples
    enhancedPrompt += `\n${'='.repeat(80)}\n`
    enhancedPrompt += `## EXAMPLES OF CORRECT RESPONSES (FOLLOW THESE PATTERNS)\n`
    enhancedPrompt += `${'='.repeat(80)}\n\n`
    
    if (userLanguage === 'pt-BR') {
      enhancedPrompt += `### Exemplo 1: Recurso encontrado no marketplace público\n\n`
      enhancedPrompt += `**Usuário**: "Existe algum documento sobre Camaleon?"\n\n`
      enhancedPrompt += `**Resposta CORRETA** ✅:\n`
      enhancedPrompt += `"Encontrei 1 recurso sobre Camaleon no marketplace público:\n\n`
      
      contextResults.slice(0, 1).forEach((r: any) => {
        const tagType = r.resource_type === 'project_folder' ? 'FOLDER' : 
                        r.resource_type === 'marketplace_template' ? 'TEMPLATE' : 'FILE'
        enhancedPrompt += `[${tagType}:${r.resource_id}:${r.name}]\n`
      })
      
      enhancedPrompt += `\nEste template do marketplace contém as regras e instruções do Camaleon. Clique no card acima para ver o conteúdo completo."\n\n`
      enhancedPrompt += `**Resposta INCORRETA** ❌:\n`
      enhancedPrompt += `"Não encontrei nada nos seus projetos. Vou pesquisar no marketplace..." (ERRADO — NÃO chame ferramentas de pesquisa, os resultados JÁ estão acima)\n\n`
      enhancedPrompt += `---\n\n`
    } else {
      enhancedPrompt += `### Example 1: Resource found in public marketplace\n\n`
      enhancedPrompt += `**User**: "Is there any document about Camaleon?"\n\n`
      enhancedPrompt += `**CORRECT Response** ✅:\n`
      enhancedPrompt += `"I found 1 resource about Camaleon in the public marketplace:\n\n`
      
      contextResults.slice(0, 1).forEach((r: any) => {
        const tagType = r.resource_type === 'project_folder' ? 'FOLDER' : 
                        r.resource_type === 'marketplace_template' ? 'TEMPLATE' : 'FILE'
        enhancedPrompt += `[${tagType}:${r.resource_id}:${r.name}]\n`
      })
      
      enhancedPrompt += `\nThis marketplace template contains Camaleon rules and instructions. Click the card above to view the full content."\n\n`
      enhancedPrompt += `**INCORRECT Response** ❌:\n`
      enhancedPrompt += `"I didn't find anything in your projects. Let me search the marketplace..." (WRONG — do NOT call search tools, the results are ALREADY provided above)\n\n`
      enhancedPrompt += `---\n\n`
    }
    
    enhancedPrompt += `\n🚨 **CRITICAL**: You MUST use the [TYPE:ID:NAME] format shown above. The UI depends on these tags!\n\n`
  } else {
    enhancedPrompt += `\n\n## Available Resources\n\n`
    enhancedPrompt += `No resources found matching the current query. This could mean:\n`
    enhancedPrompt += `- The user's knowledge base doesn't contain relevant content yet\n`
    enhancedPrompt += `- The query might need to be more specific\n`
    enhancedPrompt += `- The user might want to create new content\n\n`
    enhancedPrompt += `**IMPORTANT**: Clearly tell the user that you didn't find any matching resources in their knowledge base.\n`
    enhancedPrompt += `Suggest refining the search or offer to help create new content.`
  }

  // Add skills if available
  if (activeSkills) {
    enhancedPrompt += `\n\n${activeSkills}`
  }

  return enhancedPrompt
}

// ── Tool Execution Engine ─────────────────────────────────────────────────────

async function executeTool(
  name: string,
  input: Record<string, any>,
  supabase: ReturnType<typeof makeSupabase>,
  userId: string
): Promise<unknown> {
  switch (name) {
    case "search_user_projects": {
      const { query, type = "all", limit = 5 } = input
      const cap = Math.min(Number(limit), 20)

      let queryBuilder = supabase
        .from("project_items")
        .select("id, name, description, type, language_tags, parent_id")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(cap)

      if (type !== "all") {
        queryBuilder = queryBuilder.eq("type", type)
      }

      const { data, error } = await queryBuilder

      if (error) throw new Error(error.message)

      // Normalize field names for the AI
      const results = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        type: item.type,
        tags: item.language_tags || [],
        folder_id: item.parent_id,
      }))

      return {
        success: true,
        results,
        count: results.length
      }
    }

    case "search_marketplace_templates": {
      const { query, tags, limit = 5 } = input
      const cap = Math.min(Number(limit), 20)

      let queryBuilder = supabase
        .from("agent_templates")
        .select("id, name, description, tags, category, download_count, rating_average")
        .is("deleted_at", null)
        .not("published_at", "is", null)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(cap)

      if (tags && tags.length > 0) {
        queryBuilder = queryBuilder.contains("tags", tags)
      }

      const { data, error } = await queryBuilder.order("download_count", { ascending: false })

      if (error) throw new Error(error.message)

      return {
        success: true,
        results: data || [],
        count: data?.length || 0
      }
    }

    case "get_project_details": {
      const { resource_id, resource_type } = input

      const { data, error } = await supabase
        .from("project_items")
        .select("*")
        .eq("id", resource_id)
        .eq("user_id", userId)
        .eq("type", resource_type)
        .is("deleted_at", null)
        .single()

      if (error) throw new Error(error.message)

      return {
        success: true,
        resource: data
      }
    }

    case "get_template_details": {
      const { template_id } = input

      const { data, error } = await supabase
        .from("agent_templates")
        .select("*")
        .eq("id", template_id)
        .is("deleted_at", null)
        .not("published_at", "is", null)
        .single()

      if (error) throw new Error(error.message)

      return {
        success: true,
        template: data
      }
    }

    case "list_user_tags": {
      const { data, error } = await supabase
        .rpc("get_user_tags", { p_user_id: userId })

      if (error) throw new Error(error.message)

      return {
        success: true,
        tags: data || []
      }
    }

    case "get_user_stats": {
      // Get project counts (apenas itens não deletados)
      const { count: projectCount } = await supabase
        .from("project_items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .is("deleted_at", null)

      // Get template counts
      const { count: templateCount } = await supabase
        .from("agent_templates")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .is("deleted_at", null)

      // Get recent activity (apenas itens não deletados)
      const { data: recentProjects } = await supabase
        .from("project_items")
        .select("name, type, updated_at")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .limit(5)

      return {
        success: true,
        total_projects: projectCount || 0,
        total_templates: templateCount || 0,
        recent_activity: recentProjects || []
      }
    }

    case "create_quick_note": {
      const { title, content, tags = [] } = input

      const { data, error } = await supabase
        .from("project_items")
        .insert({
          user_id: userId,
          name: title,
          description: "Quick note created by AI assistant",
          content: content,
          type: "file",
          language_tags: tags,
        })
        .select()
        .single()

      if (error) throw new Error(error.message)

      return {
        success: true,
        message: "Note created successfully",
        note_id: data.id,
        note: data
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

// ── SSE Helpers ───────────────────────────────────────────────────────────────

const encoder = new TextEncoder()

// Extract meaningful keywords from a natural language query (multilingual)
function extractKeywords(query: string): string {
  // Common stop words in Portuguese and English to remove
  const stopWords = new Set([
    // Portuguese
    'a','o','as','os','um','uma','uns','umas','de','do','da','dos','das',
    'em','no','na','nos','nas','por','para','com','sem','sob','sobre',
    'que','se','não','nao','é','e','ou','mas','porque','porquê','como',
    'isto','isso','aqui','ali','quando','onde','quem','qual','quais',
    'eu','tu','ele','ela','nós','vós','eles','elas','me','te','nos',
    'meu','minha','meus','minhas','seu','sua','seus','suas',
    'este','esta','estes','estas','esse','essa','esses','essas',
    'existe','existem','algum','alguma','alguns','algumas',
    'gostaria','quero','preciso','poderia','pode','tem','tenho',
    'vou','vai','temos','voce','você','me','sobre','entre',
    'também','tambem','então','entao','mais','menos','muito','pouco',
    'todo','toda','todos','todas','cada','outro','outra',
    'novo','nova','novos','novas','fazer','feito','ter','sido',
    'há','ha','foi','ser','estar','ter','haver',
    // English
    'the','a','an','is','are','was','were','be','been','being',
    'have','has','had','do','does','did','will','would','shall','should',
    'may','might','must','can','could','of','in','on','at','to','for',
    'with','by','from','up','about','into','through','during',
    'i','you','he','she','it','we','they','me','him','her','us','them',
    'my','your','his','its','our','their','this','that','these','those',
    'what','which','who','when','where','why','how','all','any','both',
    'there','here','just','also','very','too','so','if','then','than',
    'and','or','but','not','no','nor','yet','still','already',
    'would','could','should','have','get','got','know','like','want',
    'need','find','look','see','come','go','make','take','give',
    'exist','exists','some','document','documents','file','files',
    'please','hello','hi','hey','thanks','thank',
  ])

  // Extract words, lowercase, remove punctuation, filter stop words and short words
  const words = query
    .toLowerCase()
    .replace(/[^a-záàâãéêíóôõúüçñ\s]/gi, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w))

  // Deduplicate and return the most relevant keywords joined
  const unique = [...new Set(words)]
  return unique.slice(0, 5).join(' ') // max 5 keywords
}

// ── Step 1: Analyse user intent to extract the real search subject ────────────
// Makes a fast, cheap LLM call to understand what the user truly needs
// Returns: { searchQuery: string, topics: string[], language: string }
async function analyzeIntent(
  message: string,
  history: OAIMessage[],
  apiKey: string
): Promise<{ searchQuery: string; topics: string[]; language: string }> {
  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('APP_URL') || 'https://kiro-agent.com',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini', // fast & cheap for intent analysis
        max_tokens: 150,
        temperature: 0,
        messages: [
          {
            role: 'system',
            content: `You are a search intent analyzer. Given a user message, extract:
1. The main search query (2-5 keywords suitable for document/file search)
2. The main topics/technologies mentioned
3. The language of the user message

Respond ONLY with valid JSON, no markdown, no explanation:
{
  "searchQuery": "react components hooks",
  "topics": ["react", "components"],
  "language": "pt-BR"
}

CRITICAL RULES — STRICTLY FOLLOW THESE:
- NEVER correct, fix, or normalise the spelling of any word the user wrote — copy their exact terms verbatim
- NEVER translate proper nouns, product names, project names, file names, or specific terms (e.g. "Camaleon", "Dengun", "DevCache")
- Only translate generic/common words (verbs, articles, prepositions) if the user wrote in a non-English language
- If the user wrote "camaleon", keep it exactly as "camaleon" — do NOT change it to "chameleon"
- searchQuery must preserve the user's exact words for names/nouns; common words may be translated to English
- topics must use the user's EXACT words for any names or products
- language is the detected language of the user message`
          },
          // Include last 2 history messages for context
          ...history.slice(-2).map((m: any) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: typeof m.content === 'string' ? m.content.slice(0, 200) : ''
          })),
          { role: 'user', content: message }
        ]
      })
    })

    if (!response.ok) {
      console.warn('⚠️ Intent analysis failed, falling back to extractKeywords')
      return { searchQuery: extractKeywords(message), topics: [], language: 'unknown' }
    }

    const data = await response.json()
    const raw = data.choices?.[0]?.message?.content?.trim() || '{}'
    
    // Remove markdown code fences if present
    const clean = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '')
    const parsed = JSON.parse(clean)

    console.log('🧠 Intent analysis:', JSON.stringify(parsed))
    return {
      searchQuery: parsed.searchQuery || extractKeywords(message),
      topics: parsed.topics || [],
      language: parsed.language || 'unknown'
    }
  } catch (err) {
    console.warn('⚠️ Intent analysis error:', err)
    return { searchQuery: extractKeywords(message), topics: [], language: 'unknown' }
  }
}

function sseEvent(data: unknown): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
}

function sseDone(): Uint8Array {
  return encoder.encode("data: [DONE]\n\n")
}

// ── OpenRouter API Call ───────────────────────────────────────────────────────

async function callOpenRouter(
  apiKey: string,
  messages: OAIMessage[],
  model: string,
  stream = false
): Promise<Response> {
  return fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": Deno.env.get("APP_URL") || "https://kiro-agent.com",
      "X-Title": "Kiro Agent Platform",
    },
    body: JSON.stringify({
      model,
      messages,
      tools: TOOLS,
      tool_choice: "auto",
      max_tokens: 4096,
      stream,
    }),
  })
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatRequest {
  sessionId: string
  message: string
  model?: string
}

interface OAIMessage {
  role: string
  content: string | null
  tool_calls?: any[]
  tool_call_id?: string
  name?: string
}

// ── Main Handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS })
  }

  try {
    // ── Authentication ──
    const authHeader = req.headers.get("Authorization")
    
    if (!authHeader) {
      console.error("Missing authorization header")
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...CORS, "Content-Type": "application/json" }
        }
      )
    }

    console.log("Auth header received:", authHeader ? "Present" : "Missing")

    // Create Supabase client with user's auth header (same as old ai-chat)
    const authSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: authHeader },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    )
    
    // Verify user authentication (same method as old ai-chat)
    const { data: { user }, error: authError } = await authSupabase.auth.getUser()

    if (authError) {
      console.error("Auth error:", authError.message)
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: authError.message }),
        {
          status: 401,
          headers: { ...CORS, "Content-Type": "application/json" }
        }
      )
    }

    if (!user) {
      console.error("No user found")
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: "No user found" }),
        {
          status: 401,
          headers: { ...CORS, "Content-Type": "application/json" }
        }
      )
    }

    const userId = user.id
    console.log("User authenticated:", userId)

    // Create service role client for database operations
    const supabase = makeSupabase()

    // ── Parse Request ──
    const { sessionId, message, model = DEFAULT_MODEL }: ChatRequest = await req.json()

    if (!sessionId || !message) {
      return new Response(
        JSON.stringify({ error: "sessionId and message are required" }),
        {
          status: 400,
          headers: { ...CORS, "Content-Type": "application/json" }
        }
      )
    }

    // ── Save User Message ──
    await supabase.from("chat_messages").insert({
      session_id: sessionId,
      role: "user",
      content: message,
    })

    // ── Get Conversation History ──
    const { data: history } = await supabase
      .rpc("get_recent_chat_context", {
        p_session_id: sessionId,
        p_limit: 10,
      })

    // ── Load User Context ──
    const userLanguage = detectLanguage(message)
    const skillsInstructions = await loadActiveSkills(supabase, userId)

    // ── Get OpenRouter API Key ──
    const apiKey = Deno.env.get("OPENROUTER_API_KEY")
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENROUTER_API_KEY not configured" }),
        {
          status: 500,
          headers: { ...CORS, "Content-Type": "application/json" }
        }
      )
    }

    // ── SSE Stream Setup ──
    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>()
    const writer = writable.getWriter()

    // Start async processing
    ;(async () => {
      try {
        // ── Accumulate thinking steps for persistence ──
        const thinkingSteps: any[] = []

        // ── Step 1: Analyse intent — understand what the user really needs ──
        const thinkStep_analyzing = {
          type: 'search_start',
          title: userLanguage === 'pt-BR' ? 'Analisando sua necessidade' : 'Analysing your request',
          description: userLanguage === 'pt-BR'
            ? 'Entendendo o assunto principal da sua mensagem...'
            : 'Understanding the main subject of your message...',
          timestamp: Date.now()
        }
        thinkingSteps.push(thinkStep_analyzing)
        await writer.write(sseEvent({ thinking: thinkStep_analyzing }))

        const intent = await analyzeIntent(message, history || [], apiKey)
        console.log('🧠 Intent:', intent)

        // Update thinking step with result
        const thinkStep_intentDone = {
          type: 'analysis',
          title: userLanguage === 'pt-BR' ? 'Necessidade identificada' : 'Intent identified',
          description: userLanguage === 'pt-BR'
            ? `Assunto principal: ${intent.topics.join(', ') || intent.searchQuery}`
            : `Main topic: ${intent.topics.join(', ') || intent.searchQuery}`,
          data: intent,
          timestamp: Date.now()
        }
        thinkingSteps.push(thinkStep_intentDone)
        await writer.write(sseEvent({ thinking: thinkStep_intentDone }))

        // ── Step 2: Search knowledge base using the extracted intent ──
        const thinkStep_searchStart = {
          type: 'search_start',
          title: userLanguage === 'pt-BR' ? 'Buscando na base de conhecimento' : 'Searching knowledge base',
          description: userLanguage === 'pt-BR'
            ? `Procurando recursos relevantes para: "${intent.searchQuery}"...`
            : `Searching for resources about: "${intent.searchQuery}"...`,
          timestamp: Date.now()
        }
        thinkingSteps.push(thinkStep_searchStart)
        await writer.write(sseEvent({ thinking: thinkStep_searchStart }))

        // ── RAG Search: Generate Embedding using the INTENT query (not raw message) ──
        const searchStartTime = Date.now()
        // Use intent.searchQuery for embedding (cleaner keywords)
        const queryEmbedding = await generateEmbedding(intent.searchQuery, apiKey)

        // For text-based LIKE matching, combine the intent query with the original
        // message keywords so that exact user terms (e.g. "camaleon") are never lost
        const originalKeywords = extractKeywords(message)
        const intentKeywords = intent.searchQuery
        // Merge: keep intent keywords + any original words not already included
        const originalWords = originalKeywords.toLowerCase().split(/\s+/).filter(Boolean)
        const intentWords = intentKeywords.toLowerCase().split(/\s+/).filter(Boolean)
        const extraWords = originalWords.filter(w => !intentWords.some(iw => iw.includes(w) || w.includes(iw)))
        const queryKeywords = extraWords.length > 0
          ? `${intentKeywords} ${extraWords.join(' ')}`
          : intentKeywords

        let searchResults: any[] = []
        
        console.log('🔍 RAG Search:')
        console.log('- Original message:', message)
        console.log('- Intent query:', intentKeywords)
        console.log('- Original keywords:', originalKeywords)
        console.log('- Combined query for text search:', queryKeywords)
        console.log('- Topics:', intent.topics)
        console.log('- Embedding generated:', queryEmbedding ? 'YES' : 'NO')
        
        if (queryEmbedding) {
          // ── RAG Search: Hybrid Search ──
          console.log('🔍 Calling search_resources_hybrid with embedding...')
          const { data, error: searchError } = await supabase.rpc('search_resources_hybrid', {
            p_user_id: userId,
            p_query_text: queryKeywords || message,
            p_query_embedding: `[${queryEmbedding.join(',')}]`,
            p_include_marketplace: true,
            p_limit: 10,
          })

          if (searchError) {
            console.error('❌ Search error:', searchError)
            console.error('❌ Error details:', JSON.stringify(searchError, null, 2))
            console.log('🔄 Falling back to text-only search...')
            
            // Fallback: busca textual em projetos E marketplace
            const searchTerm = queryKeywords || message
            const [projectResults, marketplaceResults] = await Promise.all([
              supabase
                .from('project_items')
                .select('id, name, description, type, language_tags, content')
                .eq('user_id', userId)
                .is('deleted_at', null)
                .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
                .limit(3),
              supabase
                .from('agent_templates')
                .select('id, name, description, tags, content')
                .eq('visibility', 'public')
                .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
                .limit(3)
            ])
            
            const projectItems = (projectResults.data || []).map((item: any) => ({
              resource_type: item.type === 'folder' ? 'project_folder' : 'project_item',
              resource_id: item.id,
              name: item.name,
              description: item.description,
              tags: item.language_tags || [],
              content_preview: item.content ? item.content.substring(0, 200) : '',
              relevance_score: 0.6,
              similarity_score: 0
            }))
            
            const marketplaceItems = (marketplaceResults.data || []).map((item: any) => ({
              resource_type: 'marketplace_template',
              resource_id: item.id,
              name: item.name,
              description: item.description,
              tags: item.tags || [],
              content_preview: item.content ? item.content.substring(0, 200) : '',
              relevance_score: 0.5,
              similarity_score: 0
            }))
            
            searchResults = [...projectItems, ...marketplaceItems]
          } else {
            searchResults = data || []
            console.log('✅ Hybrid search successful:', searchResults.length, 'results')
            if (searchResults.length > 0) {
              console.log('📊 Top 3 results:')
              searchResults.slice(0, 3).forEach((r, i) => {
                console.log(`  ${i + 1}. ${r.name} (${r.resource_type}) - Relevance: ${(r.relevance_score * 100).toFixed(0)}%`)
              })
            }
          }
        } else {
          console.warn('⚠️ Failed to generate embedding, using text-only search')
          
          // Fallback: busca textual em projetos E marketplace
          const searchTerm = queryKeywords || message
          const [projectResults, marketplaceResults] = await Promise.all([
            supabase
              .from('project_items')
              .select('id, name, description, type, language_tags, content')
              .eq('user_id', userId)
              .is('deleted_at', null)
              .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
              .limit(3),
            supabase
              .from('agent_templates')
              .select('id, name, description, tags, content')
              .eq('visibility', 'public')
              .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
              .limit(3)
          ])
          
          const projectItems = (projectResults.data || []).map((item: any) => ({
            resource_type: item.type === 'folder' ? 'project_folder' : 'project_item',
            resource_id: item.id,
            name: item.name,
            description: item.description,
            tags: item.language_tags || [],
            content_preview: item.content ? item.content.substring(0, 200) : '',
            relevance_score: 0.6,
            similarity_score: 0
          }))
          
          const marketplaceItems = (marketplaceResults.data || []).map((item: any) => ({
            resource_type: 'marketplace_template',
            resource_id: item.id,
            name: item.name,
            description: item.description,
            tags: item.tags || [],
            content_preview: item.content ? item.content.substring(0, 200) : '',
            relevance_score: 0.5,
            similarity_score: 0
          }))
          
          searchResults = [...projectItems, ...marketplaceItems]
        }
        
        console.log('📊 Search Results:', searchResults.length, 'resources found')
        if (searchResults.length > 0) {
          console.log('Top results:', searchResults.slice(0, 3).map(r => ({
            name: r.name,
            type: r.resource_type,
            relevance: `${(r.relevance_score * 100).toFixed(0)}%`
          })))
        }

        const searchDuration = Date.now() - searchStartTime

        // ── Thinking Step: Search Complete ──
        const thinkStep_searchComplete = {
          type: 'search_complete',
          title: userLanguage === 'pt-BR' ? 'Busca concluída' : 'Search complete',
          description: userLanguage === 'pt-BR'
            ? `Encontrados ${searchResults.length} recursos relevantes`
            : `Found ${searchResults.length} relevant resources`,
          data: searchResults.map((r: any) => ({
            name: r.name,
            type: r.resource_type,
            relevance: `${(r.relevance_score * 100).toFixed(0)}%`
          })),
          timestamp: Date.now(),
          duration: searchDuration
        }
        thinkingSteps.push(thinkStep_searchComplete)
        await writer.write(sseEvent({ thinking: thinkStep_searchComplete }))

        // ── Load User Stats ──
        const contextStartTime = Date.now()
        let userStats: any = undefined
        
        try {
          const statsResult = await executeTool('get_user_stats', {}, supabase, userId)
          if (typeof statsResult === 'object' && statsResult !== null && 'success' in statsResult) {
            userStats = statsResult
          }
        } catch (error) {
          console.error('Failed to load user stats:', error)
        }

        const contextDuration = Date.now() - contextStartTime

        // ── Thinking Step: Context Loaded ──
        const thinkStep_contextLoaded = {
          type: 'context_loaded',
          title: userLanguage === 'pt-BR' ? 'Contexto carregado' : 'Context loaded',
          description: userLanguage === 'pt-BR'
            ? `Carregados ${userStats?.total_projects || 0} projetos, ${userStats?.total_templates || 0} templates e habilidades ativas`
            : `Loaded ${userStats?.total_projects || 0} projects, ${userStats?.total_templates || 0} templates, and active skills`,
          timestamp: Date.now(),
          duration: contextDuration
        }
        thinkingSteps.push(thinkStep_contextLoaded)
        await writer.write(sseEvent({ thinking: thinkStep_contextLoaded }))

        // ── Build Enhanced System Prompt with RAG Results ──
        const systemPrompt = buildEnhancedSystemPrompt({
          userLanguage,
          userStats,
          activeSkills: skillsInstructions,
          contextResults: searchResults
        })

        // ── Build Conversation Messages ──
        const conversationMessages: OAIMessage[] = [
          { role: "system", content: systemPrompt },
          ...(history || []).slice(-10),
          { role: "user", content: message },
        ]

        console.log("Starting chat with model:", model)
        console.log("User language detected:", userLanguage)
        console.log("RAG results:", searchResults.length)

        // ── Thinking Step: Generating Response ──
        const thinkStep_generating = {
          type: 'generating',
          title: userLanguage === 'pt-BR' ? 'Gerando resposta' : 'Generating response',
          description: userLanguage === 'pt-BR'
            ? 'Processando informações e preparando recomendações...'
            : 'Processing information and preparing recommendations...',
          timestamp: Date.now()
        }
        thinkingSteps.push(thinkStep_generating)
        await writer.write(sseEvent({ thinking: thinkStep_generating }))
        let iteration = 0
        let fullResponse = ""

        // ── Tool Call Loop ──
        while (iteration < MAX_ITER) {
          console.log(`Iteration ${iteration + 1}/${MAX_ITER}`)

          // Call OpenRouter API (non-streaming to check for tool calls)
          const orRes = await callOpenRouter(apiKey, conversationMessages, model, false)

          if (!orRes.ok) {
            const errText = await orRes.text()
            await writer.write(sseEvent({ error: `OpenRouter error: ${errText}` }))
            await writer.write(sseDone())
            return
          }

          const json = await orRes.json()
          const choice = json.choices?.[0]
          const message = choice?.message
          const finishReason: string = choice?.finish_reason ?? "stop"

          // Check if AI wants to call tools
          if (finishReason !== "tool_calls" || !message?.tool_calls?.length) {
            // No tool calls - stream final response
            console.log("No tool calls, generating final response")

            // Make streaming call for final response
            const streamRes = await callOpenRouter(apiKey, conversationMessages, model, true)

            if (!streamRes.ok) {
              const errText = await streamRes.text()
              await writer.write(sseEvent({ error: `OpenRouter error: ${errText}` }))
              await writer.write(sseDone())
              return
            }

            // Stream the response
            const reader = streamRes.body?.getReader()
            const decoder = new TextDecoder()

            if (!reader) {
              await writer.write(sseDone())
              return
            }

            try {
              while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value)
                const lines = chunk.split("\n").filter((line) => line.trim() !== "")

                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    const data = line.slice(6)
                    if (data === "[DONE]") continue

                    try {
                      const parsed = JSON.parse(data)
                      const content = parsed.choices?.[0]?.delta?.content || ""
                      if (content) {
                        fullResponse += content
                        await writer.write(sseEvent({ content }))
                      }
                    } catch (e) {
                      console.error("Parse error:", e)
                    }
                  }
                }
              }
            } finally {
              reader.releaseLock()
            }

            // Check if we need to inject resource tags inline (only if AI didn't use them)
            const hasResourceTags = /\[(FILE|FOLDER|TEMPLATE):[a-f0-9-]+:.+\]/i.test(fullResponse)
            const aiSaysNotFoundInline = [
              /não encontrei nenhum/i,
              /nenhum (arquivo|ficheiro|documento|recurso|resultado|template) (foi|encontrado)/i,
              /no (files?|documents?|resources?|templates?|results?) (were )?found/i,
              /nothing (was )?found/i,
            ].some(p => p.test(fullResponse))
            const inlineRelevant = searchResults.filter((r: any) =>
              r.relevance_score !== undefined ? r.relevance_score >= 1.0 : true
            )

            if (!hasResourceTags && !aiSaysNotFoundInline && inlineRelevant.length > 0) {
              console.log('⚠️ AI did not use resource tags, injecting them in stream...')
              
              // Send resource tags via SSE
              const intro = userLanguage === 'pt-BR'
                ? `\n\n---\n\nEncontrei ${inlineRelevant.length} recurso(s) relevante(s):\n\n`
                : `\n\n---\n\nI found ${inlineRelevant.length} relevant resource(s):\n\n`
              
              await writer.write(sseEvent({ content: intro }))
              
              for (const r of inlineRelevant) {
                const tagType = r.resource_type === 'project_folder' ? 'FOLDER' :
                              r.resource_type === 'marketplace_template' ? 'TEMPLATE' : 'FILE'
                const tag = `[${tagType}:${r.resource_id}:${r.name}]\n`
                await writer.write(sseEvent({ content: tag }))
              }
            }

            // Save assistant message with post-processing
            const finalResponse = injectResourceTags(fullResponse, searchResults, userLanguage)
            
            await supabase.from("chat_messages").insert({
              session_id: sessionId,
              role: "assistant",
              content: finalResponse,
              model_used: model,
              metadata: {
                thinking: thinkingSteps,
                rag_results: searchResults.map((r: any) => ({
                  resource_id: r.resource_id,
                  resource_type: r.resource_type,
                  name: r.name,
                  relevance_score: r.relevance_score,
                  similarity_score: r.similarity_score
                })),
                search_duration_ms: searchDuration,
                context_duration_ms: contextDuration,
                post_processed: finalResponse !== fullResponse // Track if we injected tags
              }
            })

            await writer.write(sseDone())
            return
          }

          // ── Execute Tool Calls ──
          console.log(`AI requested ${message.tool_calls.length} tool call(s)`)

          const toolMessages: OAIMessage[] = []

          for (const toolCall of message.tool_calls) {
            const name: string = toolCall.function?.name ?? ""
            let input: Record<string, any> = {}
            
            try {
              input = JSON.parse(toolCall.function?.arguments ?? "{}")
            } catch {
              console.error("Failed to parse tool arguments")
            }

            // Emit tool call event
            await writer.write(
              sseEvent({ 
                tool_call: { 
                  id: toolCall.id, 
                  name, 
                  params: input 
                } 
              })
            )

            console.log(`Executing tool: ${name}`)

            let result: unknown
            let status: "done" | "error" = "done"
            
            try {
              result = await executeTool(name, input, supabase, userId)
            } catch (err) {
              status = "error"
              result = { 
                success: false, 
                error: err instanceof Error ? err.message : String(err) 
              }
              console.error(`Tool execution error (${name}):`, err)
            }

            const resultStr = JSON.stringify(result)

            // Emit tool result event
            await writer.write(
              sseEvent({
                tool_result: { 
                  id: toolCall.id, 
                  status, 
                  result: resultStr 
                },
              })
            )

            // Add tool result to conversation
            toolMessages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              name: name,
              content: resultStr,
            })
          }

          // Append assistant message with tool calls + tool results
          conversationMessages.push({
            role: "assistant",
            content: message.content ?? null,
            tool_calls: message.tool_calls,
          })

          for (const tm of toolMessages) {
            conversationMessages.push(tm)
          }

          iteration++
        }

        // ── MAX_ITER Reached - Final Call Without Tools ──
        console.log("MAX_ITER reached, making final call")

        const finalRes = await callOpenRouter(
          apiKey,
          conversationMessages.map((m) => {
            // Strip tool_calls for final response
            if (m.role === "assistant") {
              return { role: "assistant", content: m.content ?? "" }
            }
            return m
          }),
          model,
          true
        )

        if (!finalRes.ok) {
          const errText = await finalRes.text()
          await writer.write(sseEvent({ error: `OpenRouter error: ${errText}` }))
          await writer.write(sseDone())
          return
        }

        // Stream final response
        const reader = finalRes.body!.getReader()
        const dec = new TextDecoder()
        
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            const chunk = dec.decode(value)
            const lines = chunk.split("\n").filter((l) => l.startsWith("data: "))
            
            for (const line of lines) {
              const data = line.slice(6).trim()
              if (data === "[DONE]") {
                await writer.write(sseDone())
                return
              }
              
              try {
                const parsed = JSON.parse(data)
                const token: string = parsed.choices?.[0]?.delta?.content ?? ""
                if (token) {
                  fullResponse += token
                  await writer.write(sseEvent({ content: token }))
                }
              } catch {
                // Skip malformed
              }
            }
          }
        } finally {
          reader.releaseLock()
        }

        // Check if we need to inject resource tags (MAX_ITER path)
        const hasResourceTags = /\[(FILE|FOLDER|TEMPLATE):[a-f0-9-]+:.+\]/i.test(fullResponse)
        const aiSaysNotFoundMaxIter = [
          /não encontrei nenhum/i,
          /nenhum (arquivo|ficheiro|documento|recurso|resultado|template) (foi|encontrado)/i,
          /no (files?|documents?|resources?|templates?|results?) (were )?found/i,
          /nothing (was )?found/i,
        ].some(p => p.test(fullResponse))
        const maxIterRelevant = searchResults.filter((r: any) =>
          r.relevance_score !== undefined ? r.relevance_score >= 1.0 : true
        )
        
        if (!hasResourceTags && !aiSaysNotFoundMaxIter && maxIterRelevant.length > 0) {
          console.log('⚠️ AI did not use resource tags (MAX_ITER), injecting them in stream...')
          
          // Send resource tags via SSE
          const intro = userLanguage === 'pt-BR'
            ? `\n\n---\n\nEncontrei ${maxIterRelevant.length} recurso(s) relevante(s):\n\n`
            : `\n\n---\n\nI found ${maxIterRelevant.length} relevant resource(s):\n\n`
          
          await writer.write(sseEvent({ content: intro }))
          
          for (const r of maxIterRelevant) {
            const tagType = r.resource_type === 'project_folder' ? 'FOLDER' :
                          r.resource_type === 'marketplace_template' ? 'TEMPLATE' : 'FILE'
            const tag = `[${tagType}:${r.resource_id}:${r.name}]\n`
            await writer.write(sseEvent({ content: tag }))
          }
        }

        // Save assistant message with post-processing
        const finalResponse = injectResourceTags(fullResponse, searchResults, userLanguage)
        
        await supabase.from("chat_messages").insert({
          session_id: sessionId,
          role: "assistant",
          content: finalResponse,
          model_used: model,
          metadata: {
            thinking: thinkingSteps,
            rag_results: searchResults.map((r: any) => ({
              resource_id: r.resource_id,
              resource_type: r.resource_type,
              name: r.name,
              relevance_score: r.relevance_score,
              similarity_score: r.similarity_score
            })),
            search_duration_ms: searchDuration,
            context_duration_ms: contextDuration,
            post_processed: finalResponse !== fullResponse // Track if we injected tags
          }
        })

        await writer.write(sseDone())

      } catch (err) {
        console.error("Stream processing error:", err)
        try {
          await writer.write(
            sseEvent({ error: err instanceof Error ? err.message : String(err) })
          )
          await writer.write(sseDone())
        } catch {
          // Writer may already be closed
        }
      } finally {
        try {
          await writer.close()
        } catch {
          // Ignore close errors
        }
      }
    })()

    // Return SSE stream
    return new Response(readable, {
      headers: {
        ...CORS,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })

  } catch (error: any) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...CORS, "Content-Type": "application/json" }
      }
    )
  }
})
