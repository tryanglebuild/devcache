// API endpoint to manually trigger the embedding cron job
// Useful for testing and immediate processing of pending items
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication - only authenticated users can trigger
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { max_items = 50 } = await request.json().catch(() => ({}))

    // Get Supabase project URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      )
    }

    console.log('[Manual Cron] Triggering embedding generation...')

    // Call the Edge Function
    const response = await fetch(`${supabaseUrl}/functions/v1/cron-generate-embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        scheduled: false,
        max_items,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Manual Cron] Edge Function error:', errorText)
      return NextResponse.json(
        { error: 'Failed to trigger cron job', details: errorText },
        { status: response.status }
      )
    }

    const result = await response.json()

    console.log('[Manual Cron] Completed:', result)

    return NextResponse.json({
      success: true,
      message: 'Cron job triggered successfully',
      result,
    })
  } catch (error) {
    console.error('POST /api/embeddings/cron-trigger error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}
