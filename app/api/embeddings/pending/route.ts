// API endpoint to get pending embedding items
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get pending items (limit to 100)
    const { data: pendingItems, error } = await supabase
      .rpc('get_pending_embeddings', { p_limit: 100 })

    if (error) {
      console.error('Error fetching pending items:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      items: pendingItems || [],
      count: pendingItems?.length || 0
    })
  } catch (error) {
    console.error('GET /api/embeddings/pending error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
