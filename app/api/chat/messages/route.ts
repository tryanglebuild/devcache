// Chat Messages API - Get messages for a session with pagination

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Disable caching for real-time updates but optimize query
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/chat/messages?sessionId=xxx&limit=50&beforeId=xxx - Get paginated messages
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const beforeId = searchParams.get('beforeId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    // Skip session ownership check for faster response - RLS will handle it
    // Get paginated messages using optimized function
    const { data: messages, error } = await supabase.rpc(
      'get_chat_messages_paginated',
      {
        p_session_id: sessionId,
        p_limit: limit,
        p_before_id: beforeId || null,
      }
    )

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: messages })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
