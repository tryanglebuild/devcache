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
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
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

    // Generate embedding for the query
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: message,
      }),
    })

    if (!embeddingResponse.ok) {
      throw new Error('Failed to generate embedding')
    }

    const embeddingData = await embeddingResponse.json()
    const queryEmbedding = embeddingData.data[0].embedding

    // Search templates with RAG
    const { data: searchResults, error: searchError } = await supabaseClient.rpc(
      'search_templates_with_priority',
      {
        p_user_id: user.id,
        p_query_embedding: queryEmbedding,
        p_query_text: message,
        p_limit: 5,
      }
    )

    if (searchError) {
      console.error('Search error:', searchError)
    }

    // Build context from search results
    const context = buildContext(searchResults || [])

    // Get conversation history
    const { data: history } = await supabaseClient
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(10)

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

          // Save assistant response with template metadata
          const templateMetadata: Record<string, any> = {}
          if (searchResults && searchResults.length > 0) {
            searchResults.forEach((result: any) => {
              templateMetadata[result.agent_id] = {
                description: result.description,
                is_own_template: result.is_own_template,
                is_favorite: result.is_favorite,
                rating_average: result.rating_average,
                download_count: result.download_count,
              }
            })
          }

          await supabaseClient.from('chat_messages').insert({
            session_id: sessionId,
            role: 'assistant',
            content: fullResponse,
            model_used: model,
            metadata: {
              templates: templateMetadata,
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
    return 'No relevant templates found in the platform.'
  }

  return results
    .map(
      (r, i) => `
${i + 1}. ${r.name} (${r.match_reason})
   Description: ${r.description || 'No description'}
   Tags: ${r.tags?.join(', ') || 'None'}
   Rating: ${r.rating_average?.toFixed(1) || 'N/A'}⭐
   Relevance: ${(r.final_score * 100).toFixed(0)}%
   Preview: ${r.content.substring(0, 200)}...
   Template ID: ${r.agent_id}
`.trim()
    )
    .join('\n\n')
}

function buildSystemPrompt(context: string): string {
  return `You are an AI assistant for DevCache, a platform for managing development templates and code snippets.

Your role is to RECOMMEND templates that exist in the platform to users.

${context}

CRITICAL RULES - READ CAREFULLY:
1. You can ONLY recommend templates from the context above
2. DO NOT use external knowledge or search the internet
3. DO NOT recommend external resources, documentation, or tutorials
4. DO NOT explain how to code or implement solutions
5. ONLY recommend templates that appear in the context

If templates are available, use this EXACT format:

[TEMPLATE:template_id:template_name]

Then add a brief 1-sentence description of why it's relevant.

EXAMPLE RESPONSE (when templates found):
"I found the perfect template for you:

[TEMPLATE:abc-123:Google OAuth Authentication]
This is your favorite template with complete Google login setup."

EXAMPLE RESPONSE (when NO templates found):
"I couldn't find a relevant template in your library or the marketplace for that specific need. You can:
- Browse the marketplace to see all available templates
- Create a new template for this use case"

IMPORTANT:
- Maximum 3 template recommendations
- Prioritize user's own templates and favorites
- If the context shows "No relevant templates found", you MUST say you couldn't find anything
- DO NOT make up template names or IDs
- DO NOT provide external links or documentation
- DO NOT explain implementation steps

Your ONLY job is to recommend templates that exist in the platform.`
}
