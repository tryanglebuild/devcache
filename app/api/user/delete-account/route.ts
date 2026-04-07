import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify email matches
    if (user.email !== email) {
      return NextResponse.json(
        { error: 'Email does not match your account' },
        { status: 400 }
      )
    }

    // Verify password one more time before deletion
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Delete user data from public tables (cascade will handle related data)
    // Note: RLS policies should allow users to delete their own data
    
    // Delete profile
    await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    // Delete agent templates
    await supabase
      .from('agent_templates')
      .delete()
      .eq('user_id', user.id)

    // Delete project items
    await supabase
      .from('project_items')
      .delete()
      .eq('user_id', user.id)

    // Delete chat sessions
    await supabase
      .from('chat_sessions')
      .delete()
      .eq('user_id', user.id)

    // Delete user tags
    await supabase
      .from('user_tags')
      .delete()
      .eq('user_id', user.id)

    // Delete user skills
    await supabase
      .from('user_skills')
      .delete()
      .eq('user_id', user.id)

    // Delete user model preferences
    await supabase
      .from('user_model_preferences')
      .delete()
      .eq('user_id', user.id)

    // Delete agent collections
    await supabase
      .from('agent_collections')
      .delete()
      .eq('user_id', user.id)

    // Finally, delete the auth user (this will cascade to auth.identities, sessions, etc.)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Error deleting user from auth:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      )
    }

    // Sign out the user
    await supabase.auth.signOut()

    return NextResponse.json({ 
      success: true,
      message: 'Account deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
