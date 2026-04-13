// Send Message API - Proxy to Edge Function with streaming
// Acts as a secure gateway: validates auth, checks session ownership, enforces rate limits,
// then forwards the request to the ai-chat2 Supabase Edge Function which handles RAG + AI.

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { SendMessageRequest } from '@/types/chat'

// Run on the Edge Runtime for lower latency and streaming support
export const runtime = 'edge'

// POST /api/chat/send - Send message and stream response
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: SendMessageRequest = await request.json()

    if (!body.sessionId || !body.message) {
      return NextResponse.json(
        { error: 'sessionId and message are required' },
        { status: 400 }
      )
    }

    // Reject messages that exceed the maximum allowed length
    if (body.message.length > 10_000) {
      return NextResponse.json(
        { error: 'Message exceeds the maximum length of 10,000 characters' },
        { status: 400 }
      )
    }

    // Verify session ownership
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', body.sessionId)
      .eq('user_id', user.id)
      .single()

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Rate limit: max 20 user messages per session per minute
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString()
    const { count: recentCount } = await supabase
      .from('chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', body.sessionId)
      .eq('role', 'user')
      .gte('created_at', oneMinuteAgo)

    if ((recentCount ?? 0) >= 20) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before sending more messages.' },
        { status: 429 }
      )
    }

    // Get auth token
    const { data: { session: authSession } } = await supabase.auth.getSession()
    
    if (!authSession) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      )
    }

    // Call Edge Function (ai-chat2 - new version with RAG + tool calling)
    const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-chat2`
    
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authSession.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: body.sessionId,
        message: body.message,
        model: body.model,
        // Note: ai-chat2 handles RAG search automatically, no need for includeMarketplace flag
        // Note: ai-chat2 doesn't use progressive context gathering, it uses RAG-first approach
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Edge function error:', error)
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: response.status }
      )
    }

    // Return streaming response
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
