import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clearedAt = new Date().toISOString()

    const { error } = await supabase
      .from('profiles')
      .update({ activity_cleared_at: clearedAt })
      .eq('id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, clearedAt })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear activity' }, { status: 500 })
  }
}
