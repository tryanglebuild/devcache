// AI Chat Edge Function with RAG Integration
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
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get JWT from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create Supabase client with user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Validate JWT and get user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(JSON.stringify({ 
        code: 401,
        message: authError?.message || 'Unauthorized' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { sessionId, message, model = 'anthropic/claude-3-haiku', includeMarketplace = true }: ChatRequest =
      await req.json()

    // Validate input
    if (!sessionId || !message) {
      return new Response(JSON.stringify({ error: 'sessionId and message are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Save user message
    const { error: saveError } = await supabaseClient.from('chat_messages').insert({
      session_id: sessionId,
      role: 'user',
      content: message,
    })

    if (saveError) {
      console.error('Error saving message:', saveError)
    }

    // Generate embedding for the query using OpenRouter
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

    // Search templates with hybrid RAG (vector + text search)
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

    // Build context from search results
    const context = buildContext(searchResults || [])

    // Get conversation history (optimized with new function)
    const { data: history } = await supabaseClient.rpc('get_recent_chat_context', {
      p_session_id: sessionId,
      p_limit: 10,
    })

    // Build messages for AI
    const messages = [
      {
        role: 'system',
        content: buildSystemPrompt(context),
      },
      ...(history || []).slice(-10),
      {
        role: 'user',
        content: message,
      },
    ]

    // Call OpenRouter
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

    // Stream response
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

          // Save assistant response with resource metadata
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
  } catch (error) {
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
    .map((r, i) => {
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

function buildSystemPrompt(context: string): string {
  return `You are an AI assistant for DevCache, a platform for managing development templates, code snippets, and project files.

CRITICAL RULES - YOU MUST FOLLOW THESE EXACTLY:

1. RESOURCE RECOMMENDATION ONLY
   - You can ONLY recommend resources that appear in the CONTEXT below
   - DO NOT use external knowledge, documentation, or tutorials
   - DO NOT recommend external resources, websites, or documentation
   - DO NOT explain how to code or implement solutions
   - DO NOT provide coding advice or implementation steps
   - If NO resources are found in context, you MUST say you couldn't find anything

2. RESPONSE FORMAT
   When resources ARE found, use this EXACT format:
   
   For folders: [FOLDER:resource_id:folder_name]
   For files: [FILE:resource_id:file_name]
   For templates: [TEMPLATE:resource_id:template_name]
   
   Then add ONE sentence explaining why it's relevant.

3. WHEN NO RESOURCES FOUND
   If context shows "No relevant resources found", respond:
   "I couldn't find any relevant files, folders, or templates in your library or the marketplace for that query. You can browse your projects page or the marketplace to see all available resources."

4. MAXIMUM RECOMMENDATIONS
   - Recommend maximum 3 resources
   - Prioritize user's own files and folders over marketplace
   - Prioritize folders when they match the query

${context}

EXAMPLE RESPONSE (resources found):
"I found the perfect folder for you:

[FOLDER:abc-123:cgc]
This folder contains 4 files related to CGC documentation."

EXAMPLE RESPONSE (no resources):
"I couldn't find any relevant files, folders, or templates in your library or the marketplace for that query. You can browse your projects page or the marketplace to see all available resources."

REMEMBER: You are FORBIDDEN from:
- Recommending external resources
- Explaining how to code
- Providing implementation steps
- Using knowledge outside the CONTEXT
- Making up resource names or IDs`
}
