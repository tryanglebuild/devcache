// API endpoint to get embedding statistics and cron logs
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

    // Get embedding statistics
    const { data: stats, error: statsError } = await supabase
      .rpc('get_embedding_stats')

    if (statsError) {
      console.error('Error fetching embedding stats:', statsError)
      return NextResponse.json({ error: statsError.message }, { status: 500 })
    }

    // Get recent cron logs (last 10 runs)
    const { data: cronLogs, error: logsError } = await supabase
      .from('embedding_cron_logs')
      .select('*')
      .order('run_at', { ascending: false })
      .limit(10)

    if (logsError) {
      console.error('Error fetching cron logs:', logsError)
      // Don't fail if logs can't be fetched
    }

    // Get pending items count
    const { data: pendingItems, error: pendingError } = await supabase
      .rpc('get_pending_embeddings', { p_limit: 1 })

    const hasPendingItems = !pendingError && pendingItems && pendingItems.length > 0

    return NextResponse.json({
      stats: stats?.[0] || null,
      cron_logs: cronLogs || [],
      has_pending_items: hasPendingItems,
      last_updated: new Date().toISOString()
    })
  } catch (error) {
    console.error('GET /api/embeddings/stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
