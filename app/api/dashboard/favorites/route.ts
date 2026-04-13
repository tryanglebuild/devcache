import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const DEFAULT_LIMIT = 6

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = req.nextUrl
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10)))
    const offset = (page - 1) * limit

    const [{ data: items }, { count }] = await Promise.all([
      supabase
        .from('project_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_favorite', true)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1),
      supabase
        .from('project_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_favorite', true)
        .is('deleted_at', null),
    ])

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
    console.error('Error fetching favorites:', error)
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
  }
}
