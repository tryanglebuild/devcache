// AI Chat Edge Function - Main entry point

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { OpenRouterClient } from './openrouter.ts'
import { ContextBuilder } from './context-builder.ts'
import { ChatRequest, ChatSession, SearchResult } from './types.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Initialize clients
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // 2. Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Parse request
    const { sessionId, message, model, includeMarketplace = true }: ChatRequest = await req.json()

    if (!sessionId || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: sessionId, message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Get session
    const { data: session, error: sessionError } = await supabaseClient
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const chatSession = session as ChatSession

    // 5. Save user message
    const { data: userMessage, error: userMessageError } = await supabaseClient
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content: message,
      })
      .select()
      .single()

    if (userMessageError) {
      throw new Error(`Failed to save user message: ${userMessageError.message}`)
    }

    // 6. Execute search
    const { data: searchResults, error: searchError } = await supabaseClient
      .rpc('search_resources', {
        p_user_id: user.id,
        p_query: message,
        p_include_marketplace: includeMarketplace,
        p_limit: 5,
      })

    const results = (searchResults || []) as SearchResult[]

    // 7. Save search results
    if (results.length > 0) {
      const searchResultsToInsert = results.map(result => ({
        message_id: userMessage.id,
        resource_type: result.resource_type,
        resource_id: result.resource_id,
        relevance_score: result.relevance_score,
        matched_fields: {
          name: result.name,
          description: result.description,
          tags: result.tags,
        },
      }))

      await supabaseClient
        .from('chat_search_results')
        .insert(searchResultsToInsert)
    }

    // 8. Get conversation history
    const { data: historyMessages } = await supabaseClient
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(20)

    const history = historyMessages || []

    // 9. Build AI context
    const contextBuilder = new ContextBuilder()
    const aiMessages = contextBuilder.buildFullContext(
      message,
      results,
      history.slice(0, -1) // Exclude the current message
    )

    // 10. Initialize OpenRouter client
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY not configured')
    }

    const openRouter = new OpenRouterClient(openRouterApiKey)
    const selectedModel = model || chatSession.selected_model

    // 11. Stream response
    const encoder = new TextEncoder()
    let fullResponse = ''
    let inputTokens = contextBuilder.estimateTokenCount(aiMessages)
    let outputTokens = 0

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of openRouter.streamChatCompletion(aiMessages, selectedModel)) {
            fullResponse += chunk
            outputTokens += Math.ceil(chunk.length / 4)
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
          }

          // Calculate cost
          const cost = openRouter.calculateCost(inputTokens, outputTokens, selectedModel)

          // Save assistant message
          await supabaseClient
            .from('chat_messages')
            .insert({
              session_id: sessionId,
              role: 'assistant',
              content: fullResponse,
              model_used: selectedModel,
              tokens_input: inputTokens,
              tokens_output: outputTokens,
              cost_usd: cost,
            })

          // Update session last activity
          await supabaseClient
            .from('chat_sessions')
            .update({ last_activity_at: new Date().toISOString() })
            .eq('id', sessionId)

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
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
    console.error('Error in ai-chat function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
