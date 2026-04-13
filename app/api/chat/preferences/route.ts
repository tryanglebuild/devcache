// User Model Preferences API
// Manages which AI model the user prefers by default and their list of favorite models.
// Auto-creates default preferences on first GET if the user has no record yet.

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { UpdatePreferencesRequest } from '@/types/chat'

// GET /api/chat/preferences - Get user's model preferences
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: preferences, error } = await supabase
      .from('user_model_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching preferences:', error)
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      )
    }

    // If no preferences exist, create default ones
    if (!preferences) {
      const { data: newPreferences, error: createError } = await supabase
        .from('user_model_preferences')
        .insert({
          user_id: user.id,
          default_model: 'anthropic/claude-3-haiku',
          favorite_models: [],
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating preferences:', createError)
        return NextResponse.json(
          { error: 'Failed to create preferences' },
          { status: 500 }
        )
      }

      return NextResponse.json({ data: newPreferences })
    }

    return NextResponse.json({ data: preferences })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/chat/preferences - Update user's model preferences
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: UpdatePreferencesRequest = await request.json()

    // Check if preferences exist
    const { data: existing } = await supabase
      .from('user_model_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single()

    let preferences

    if (existing) {
      // Update existing preferences
      const { data, error } = await supabase
        .from('user_model_preferences')
        .update(body)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating preferences:', error)
        return NextResponse.json(
          { error: 'Failed to update preferences' },
          { status: 500 }
        )
      }

      preferences = data
    } else {
      // Create new preferences
      const { data, error } = await supabase
        .from('user_model_preferences')
        .insert({
          user_id: user.id,
          ...body,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating preferences:', error)
        return NextResponse.json(
          { error: 'Failed to create preferences' },
          { status: 500 }
        )
      }

      preferences = data
    }

    return NextResponse.json({ data: preferences })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
