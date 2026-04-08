// Chat Sessions API - List, Create, Bulk Delete

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { CreateSessionRequest } from '@/types/chat'

// Optimize for fast response
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/chat/sessions - List user's chat sessions
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Limit to 50 most recent sessions for faster loading
    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('id, title, context_type, selected_model, last_activity_at, created_at')
      .eq('user_id', user.id)
      .order('last_activity_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching sessions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: sessions })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/chat/sessions - Create new chat session
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

    const body: CreateSessionRequest = await request.json()
    
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Get user's default model preference
    const { data: preferences } = await supabase
      .from('user_model_preferences')
      .select('default_model')
      .eq('user_id', user.id)
      .single()

    const defaultModel = body.selected_model || preferences?.default_model || 'anthropic/claude-3-haiku'

    const { data: session, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: user.id,
        title: body.title,
        context_type: body.context_type || 'general',
        selected_model: defaultModel,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating session:', error)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: session }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/chat/sessions - Bulk delete sessions
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: { ids: string[] } = await request.json()

    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json(
        { error: 'ids array is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .in('id', body.ids)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error bulk deleting sessions:', error)
      return NextResponse.json(
        { error: 'Failed to delete sessions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Sessions deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
