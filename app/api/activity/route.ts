import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Always fetch fresh data — activity must reflect the latest user actions
export const dynamic = 'force-dynamic'

const DEFAULT_LIMIT = 10

// GET /api/activity — returns paginated activity log for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse pagination params; clamp limit between 1 and 50
    const { searchParams } = req.nextUrl
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10)))
    const offset = (page - 1) * limit

    // Check if the user has ever cleared their activity history
    const { data: profile } = await supabase
      .from('profiles')
      .select('activity_cleared_at')
      .eq('id', user.id)
      .single()

    // Base queries — both will be filtered by activity_cleared_at when present
    let countQuery = supabase
      .from('activity_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Join related project items and agent templates so the UI can render rich rows
    let dataQuery = supabase
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
        ),
        agent_templates (
          id,
          name,
          category,
          description
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Exclude entries older than the last clear timestamp
    if (profile?.activity_cleared_at) {
      countQuery = countQuery.gt('created_at', profile.activity_cleared_at)
      dataQuery = dataQuery.gt('created_at', profile.activity_cleared_at)
    }

    // Run data fetch and count in parallel for performance
    const [{ data: items }, { count }] = await Promise.all([dataQuery, countQuery])

    return NextResponse.json({
      items: items ?? [],
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
        hasNextPage: offset + limit < (count ?? 0),
      },
    })
  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
  }
}
