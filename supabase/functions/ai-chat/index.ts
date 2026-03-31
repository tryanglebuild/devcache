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

    // Initialize Supabase client with service role for database operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Verify JWT and get user (using service role client)
    const jwt = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(jwt)

    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(JSON.stringify({ 
        code: 401,
        message: authError?.message || 'Invalid JWT' 
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
    return 'No relevant templates or files found in the platform.'
  }

  return results
    .map(
      (r, i) => `
${i + 1}. ${r.name} (${r.resource_type === 'project_item' ? 'Your File' : 'Marketplace Template'})
   Description: ${r.description || 'No description'}
   Tags: ${r.tags?.join(', ') || 'None'}
   Semantic Similarity: ${(r.similarity_score * 100).toFixed(0)}%
   Relevance Score: ${(r.relevance_score * 100).toFixed(0)}%
   Preview: ${r.content_preview || 'No preview available'}
   Resource ID: ${r.resource_id}
   Type: ${r.resource_type}
`.trim()
    )
    .join('\n\n')
}

function buildSystemPrompt(context: string): string {
  return `You are an AI assistant for DevCache, a platform for managing development templates, code snippets, and project files.

Your role is to RECOMMEND resources (templates and files) that exist in the platform to users.

${context}

CRITICAL RULES - READ CAREFULLY:
1. You can ONLY recommend resources from the context above
2. DO NOT use external knowledge or search the internet
3. DO NOT recommend external resources, documentation, or tutorials
4. DO NOT explain how to code or implement solutions
5. ONLY recommend resources that appear in the context

If resources are available, use this EXACT format:

For project files: [FILE:resource_id:file_name]
For marketplace templates: [TEMPLATE:resource_id:template_name]

Then add a brief 1-sentence description of why it's relevant.

EXAMPLE RESPONSE (when resources found):
"I found the perfect file for you:

[FILE:abc-123:authentication-setup.md]
This file contains your Google OAuth setup documentation."

EXAMPLE RESPONSE (when NO resources found):
"I couldn't find a relevant file or template in your library or the marketplace for that specific need. You can:
- Browse the marketplace to see all available templates
- Create a new file or template for this use case"

IMPORTANT:
- Maximum 3 resource recommendations
- Prioritize user's own files and favorites
- If the context shows "No relevant templates or files found", you MUST say you couldn't find anything
- DO NOT make up resource names or IDs
- DO NOT provide external links or documentation
- DO NOT explain implementation steps
- Pay attention to semantic similarity scores - higher scores mean better matches

Your ONLY job is to recommend resources that exist in the platform.`
}
