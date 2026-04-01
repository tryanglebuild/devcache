import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { default_model } = body

    if (!default_model) {
      return NextResponse.json(
        { error: 'Default model is required' },
        { status: 400 }
      )
    }

    // Check if preferences exist
    const { data: existing } = await supabase
      .from('user_model_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single()

    let data, error

    if (existing) {
      // Update existing preferences
      const result = await supabase
        .from('user_model_preferences')
        .update({
          default_model,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single()
      
      data = result.data
      error = result.error
    } else {
      // Create new preferences
      const result = await supabase
        .from('user_model_preferences')
        .insert({
          user_id: user.id,
          default_model,
        })
        .select()
        .single()
      
      data = result.data
      error = result.error
    }

    if (error) {
      console.error('Update preferences error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ preferences: data })
  } catch (error) {
    console.error('PUT /api/user/preferences error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
