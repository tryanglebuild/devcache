import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/agents/trending - Get trending agents
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const supabase = await createClient()
    
    // Get agents with recent activity (downloads and executions in last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { data: agents, error } = await supabase
      .from('agent_templates')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('visibility', 'public')
      .gte('updated_at', sevenDaysAgo.toISOString())
      .order('download_count', { ascending: false })
      .order('rating_average', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Get trending agents error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(agents || [])
  } catch (error) {
    console.error('GET /api/agents/trending error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
