import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/collections - Get user's agent collection
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const favoritesOnly = searchParams.get('favorites') === 'true'
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    let query = supabase
      .from('agent_collections')
      .select(`
        *,
        agent_templates (
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (favoritesOnly) {
      query = query.eq('is_favorite', true)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Get collections error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('GET /api/collections error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
