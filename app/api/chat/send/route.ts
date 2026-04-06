// Send Message API - Proxy to Edge Function with streaming

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { SendMessageRequest } from '@/types/chat'

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

    // Get auth token
    const { data: { session: authSession } } = await supabase.auth.getSession()
    
    if (!authSession) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      )
    }

    // Call Edge Function
    const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-chat`
    
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
        includeMarketplace: body.includeMarketplace ?? true,
        enableContextGathering: true, // Enable progressive context gathering
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
