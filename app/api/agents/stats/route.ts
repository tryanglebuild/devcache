import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/agents/stats - Get marketplace and user stats
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    const supabase = await createClient()
    
    // Get marketplace stats
    const { data: marketplaceStats, error: marketplaceError } = await supabase
      .rpc('get_marketplace_stats')
    
    if (marketplaceError) {
      console.error('Get marketplace stats error:', marketplaceError)
      return NextResponse.json(
        { error: marketplaceError.message },
        { status: 500 }
      )
    }
    
    const response: any = {
      marketplace: marketplaceStats?.[0] || {
        total_agents: 0,
        total_creators: 0,
        total_downloads: 0,
        total_executions: 0,
        average_rating: 0
      }
    }
    
    // Get user stats if userId provided
    if (userId) {
      const { data: userStats, error: userError } = await supabase
        .rpc('get_user_agent_stats', { p_user_id: userId })
      
      if (userError) {
        console.error('Get user stats error:', userError)
      } else {
        response.user = userStats?.[0] || {
          total_agents: 0,
          total_downloads: 0,
          total_executions: 0,
          average_rating: 0,
          total_reviews: 0
        }
      }
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('GET /api/agents/stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
