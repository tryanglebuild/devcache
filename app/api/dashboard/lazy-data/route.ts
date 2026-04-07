import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  getTrendingAgents,
  getPublicAgents
} from '@/lib/agents/queries'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch recent activity with error handling
    let recentActivity = null
    try {
      const { data } = await supabase
        .from('activity_log')
        .select(`
          id,
          action_type,
          created_at,
          project_items (
            id,
            name,
            type,
            description
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      
      recentActivity = data
    } catch (error) {
      console.error('Failed to fetch activity:', error)
    }

    // Fetch non-critical data in parallel
    const [trendingAgents, publicAgents] = await Promise.all([
      getTrendingAgents(10),
      getPublicAgents(6)
    ])

    return NextResponse.json({
      trendingAgents,
      publicAgents,
      recentActivity
    })
  } catch (error) {
    console.error('Error fetching lazy data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
