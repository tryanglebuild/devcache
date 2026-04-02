// Skills Toggle API - Activate/Deactivate skill
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current state
    const { data: skill } = await supabase
      .from('user_skills')
      .select('is_active')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }

    // Toggle state
    const { data: updated, error } = await supabase
      .from('user_skills')
      .update({ is_active: !skill.is_active })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Toggle error:', error)
      return NextResponse.json({ error: 'Failed to toggle skill' }, { status: 500 })
    }

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
