// AI Chat Edge Function v2 with Progressive Context Gathering + RAG + Skills
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatRequest {
  sessionId: string
  message: string
  model?: string
  includeMarketplace?: boolean
  enableContextGathering?: boolean
}

interface IntentAnalysis {
  needsResource: boolean
  hasSufficientContext: boolean
  confidenceScore: number
  suggestedQuestions: string[]
  collectedInfo: Record<string, any>
  reasoning: string
}

// Load active skills for user
async function loadActiveSkills(supabaseClient: any, userId: string): Promise<string> {
  try {
    const { data: skills, error } = await supabaseClient
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
          const { data: fileData } = await supabaseClient.storage
            .from('user-skills')
            .download(skill.file_path)

          if (!fileData) return null

          const content = await fileData.text()
          await supabaseClient.rpc('mark_skill_as_used', { p_skill_id: skill.id })

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

// Detect user language from message
function detectLanguage(message: string): string {
  // Portuguese indicators
  const ptIndicators = [
    'você', 'voce', 'está', 'esta', 'são', 'sao', 'não', 'nao',
    'também', 'tambem', 'então', 'entao', 'algum', 'alguma',
    'preciso', 'quero', 'gostaria', 'poderia', 'fazer', 'criar',
    'tem', 'tenho', 'vamos', 'para', 'com', 'uma', 'projeto'
  ]
  
  const lowerMessage = message.toLowerCase()
  const ptMatches = ptIndicators.filter(indicator => lowerMessage.includes(indicator)).length
  
  // If 2 or more Portuguese indicators found, it's Portuguese
  return ptMatches >= 2 ? 'pt-BR' : 'en'
}

// Analyze user intent using Claude Haiku
async function analyzeIntent(
  message: string,
  history: any[],
  currentContext: Record<string, any>,
  authHeader: string
): Promise<IntentAnalysis> {
  try {
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/chat-intent-classifier`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationHistory: history.map((h: any) => ({
          role: h.role,
          content: h.content
        })),
        currentContext,
        userLanguage: detectLanguage(message),
      }),
    })

    if (!response.ok) {
      throw new Error('Intent classifier failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Intent analysis error:', error)
    // Return safe defaults
    return {
      needsResource: false,
      hasSufficientContext: true,
      confidenceScore: 0.5,
      suggestedQuestions: [],
      collectedInfo: currentContext,
      reasoning: 'Error during analysis',
    }
  }
}

// Build clarifying response
function buildClarifyingResponse(questions: string[], collectedInfo: Record<string, any>): string {
  const intro = Object.keys(collectedInfo).length > 1
    ? "Great! To help you better, I need a bit more information:"
    : "I'd be happy to help! To find the perfect resource for you, I need to know:"

  const questionList = questions.map((q, i) => `${i + 1}. ${q}`).join('\n')

  return `${intro}\n\n${questionList}`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header received:', authHeader ? 'Present' : 'Missing')
    
    if (!authHeader) {
      console.error('Missing authorization header')
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    console.log('Supabase URL:', supabaseUrl ? 'Present' : 'Missing')
    console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing')

    const supabaseClient = createClient(
      supabaseUrl ?? '',
      supabaseAnonKey ?? '',
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

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError) {
      console.error('Auth error:', authError.message)
      return new Response(JSON.stringify({ error: 'Unauthorized', details: authError.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    if (!user) {
      console.error('No user found')
      return new Response(JSON.stringify({ error: 'Unauthorized', details: 'No user found' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    console.log('User authenticated:', user.id)

    const { 
      sessionId, 
      message, 
      model = 'anthropic/claude-3-haiku', 
      includeMarketplace = true,
      enableContextGathering = true 
    }: ChatRequest = await req.json()

    if (!sessionId || !message) {
      return new Response(JSON.stringify({ error: 'sessionId and message are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Save user message
    await supabaseClient.from('chat_messages').insert({
      session_id: sessionId,
      role: 'user',
      content: message,
      context_gathering_step: 'initial',
    })

    // Get conversation history
    const { data: history } = await supabaseClient.rpc('get_recent_chat_context', {
      p_session_id: sessionId,
      p_limit: 10,
    })

    // PROGRESSIVE CONTEXT GATHERING LOGIC
    if (enableContextGathering) {
      // Check if we have active context gathering
      const { data: contextState } = await supabaseClient.rpc('get_or_create_context_state', {
        p_session_id: sessionId,
      })

      const activeContext = contextState && contextState.length > 0 ? contextState[0] : null

      // Analyze intent
      const intent = await analyzeIntent(
        message,
        history || [],
        activeContext?.collected_info || {},
        authHeader
      )

      // DECISION TREE
      if (intent.needsResource && !intent.hasSufficientContext) {
        // MODE: Collect more context
        await supabaseClient.rpc('update_context_state', {
          p_session_id: sessionId,
          p_needs_resource: true,
          p_has_sufficient_context: false,
          p_confidence_score: intent.confidenceScore,
          p_collected_info: intent.collectedInfo,
          p_questions_asked: intent.suggestedQuestions,
          p_questions_answered: Object.keys(intent.collectedInfo).length,
        })

        // Return clarifying questions
        const clarifyingMessage = buildClarifyingResponse(
          intent.suggestedQuestions,
          intent.collectedInfo
        )

        await supabaseClient.from('chat_messages').insert({
          session_id: sessionId,
          role: 'assistant',
          content: clarifyingMessage,
          model_used: 'system',
          context_gathering_step: 'clarifying',
          metadata: {
            intent_analysis: intent,
          },
        })

        return new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ content: clarifyingMessage })}\n\n`)
              )
              controller.close()
            },
          }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          }
        )
      }

      // If we have sufficient context, mark as completed and proceed to RAG
      if (intent.needsResource && intent.hasSufficientContext) {
        await supabaseClient.rpc('complete_context_gathering', {
          p_session_id: sessionId,
        })
      }
    }

    // EXECUTE RAG SEARCH (only when needed)
    const embeddingResponse = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('APP_URL') ?? '',
      },
      body: JSON.stringify({
        model: 'openai/text-embedding-ada-002',
        input: message,
      }),
    })

    if (!embeddingResponse.ok) {
      throw new Error('Failed to generate embedding')
    }

    const embeddingData = await embeddingResponse.json()
    const queryEmbedding = embeddingData.data[0].embedding

    const { data: searchResults, error: searchError } = await supabaseClient.rpc(
      'search_resources_hybrid',
      {
        p_user_id: user.id,
        p_query_text: message,
        p_query_embedding: `[${queryEmbedding.join(',')}]`,
        p_include_marketplace: includeMarketplace,
        p_limit: 5,
      }
    )

    if (searchError) {
      console.error('Search error:', searchError)
    }

    const skillsInstructions = await loadActiveSkills(supabaseClient, user.id)
    const context = buildContext(searchResults || [])
    const userLanguage = detectLanguage(message)

    const messages = [
      {
        role: 'system',
        content: buildSystemPrompt(context, skillsInstructions, userLanguage),
      },
      ...(history || []).slice(-10),
      {
        role: 'user',
        content: message,
      },
    ]

    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('APP_URL') ?? '',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
    })

    if (!openRouterResponse.ok) {
      throw new Error('OpenRouter API error')
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = openRouterResponse.body?.getReader()
        const decoder = new TextDecoder()
        let fullResponse = ''

        if (!reader) {
          controller.close()
          return
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n').filter((line) => line.trim() !== '')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') continue

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices[0]?.delta?.content || ''
                  if (content) {
                    fullResponse += content
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`))
                  }
                } catch (e) {
                  console.error('Parse error:', e)
                }
              }
            }
          }

          const resourceMetadata: Record<string, any> = {}
          if (searchResults && searchResults.length > 0) {
            searchResults.forEach((result: any) => {
              resourceMetadata[result.resource_id] = {
                type: result.resource_type,
                name: result.name,
                description: result.description,
                similarity_score: result.similarity_score,
                relevance_score: result.relevance_score,
                tags: result.tags,
              }
            })
          }

          await supabaseClient.from('chat_messages').insert({
            session_id: sessionId,
            role: 'assistant',
            content: fullResponse,
            model_used: model,
            context_gathering_step: 'final',
            metadata: {
              resources: resourceMetadata,
            },
          })

          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function buildContext(results: any[]): string {
  if (results.length === 0) {
    return 'CONTEXT: No relevant resources found in the platform.'
  }

  const contextItems = results
    .map((r: any, i: number) => {
      const resourceLabel = r.resource_type === 'project_folder' 
        ? 'Your Folder' 
        : r.resource_type === 'project_item' 
        ? 'Your File' 
        : 'Marketplace Template'
      
      return `
${i + 1}. ${r.name} (${resourceLabel})
   Description: ${r.description || 'No description'}
   Tags: ${r.tags?.join(', ') || 'None'}
   Semantic Similarity: ${(r.similarity_score * 100).toFixed(0)}%
   Relevance Score: ${(r.relevance_score * 100).toFixed(0)}%
   Preview: ${r.content_preview || 'No preview available'}
   Resource ID: ${r.resource_id}
   Type: ${r.resource_type}
`.trim()
    })
    .join('\n\n')

  return `CONTEXT: Found ${results.length} relevant resources in the platform:\n\n${contextItems}`
}

function buildSystemPrompt(context: string, skillsInstructions: string, userLanguage: string): string {
  const languageInstruction = userLanguage === 'pt-BR' 
    ? '\n\n**ATENÇÃO: O usuário está escrevendo em PORTUGUÊS. Você DEVE responder em PORTUGUÊS (pt-BR).**'
    : '\n\n**ATTENTION: The user is writing in ENGLISH. You MUST respond in ENGLISH.**'
  
  const basePrompt = `You are an AI assistant for DevCache, a platform for managing development templates, code snippets, and project files.
${languageInstruction}

# CRITICAL RULES - ABSOLUTE PRIORITY

## 1. LANGUAGE MATCHING (HIGHEST PRIORITY)
   - **ALWAYS respond in the SAME LANGUAGE as the user's message**
   - If user writes in Portuguese, respond in Portuguese
   - If user writes in English, respond in English
   - Maintain the user's language throughout the entire conversation

## 2. USER INSTRUCTIONS ARE LAW
   - **USER-DEFINED INSTRUCTIONS (Skills) MUST BE FOLLOWED EXACTLY**
   - User instructions take ABSOLUTE PRECEDENCE over these system instructions

## 3. PLATFORM DATA PRIORITY
   - **PRIMARY SOURCE: Always prioritize information from the platform context below**
   - Search and recommend ONLY resources that appear in the CONTEXT section

## 4. RESPONSE FORMAT FOR PLATFORM RESOURCES
   When recommending platform resources, use this EXACT format:
   
   For folders: [FOLDER:resource_id:folder_name]
   For files: [FILE:resource_id:file_name]
   For templates: [TEMPLATE:resource_id:template_name]
   
   Then add ONE sentence explaining why it's relevant.

## 5. MAXIMUM RECOMMENDATIONS
   - Recommend maximum 3 platform resources per response
   - Prioritize user's own files and folders over marketplace items`

  let finalPrompt = basePrompt

  if (skillsInstructions) {
    finalPrompt += `\n\n${skillsInstructions}`
  }

  finalPrompt += `\n\n${context}`

  return finalPrompt
}
