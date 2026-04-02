// Skills Detail API - Get, Update, Delete specific skill
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { UpdateSkillRequest } from '@/types/skills'
import { updateSkillSchema } from '@/lib/validations/skills'

// GET /api/skills/[id] - Get skill details
export async function GET(
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

    const { data: skill, error } = await supabase
      .from('user_skills')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }

    return NextResponse.json({ data: skill })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/skills/[id] - Update skill
export async function PATCH(
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

    const body: UpdateSkillRequest = await request.json()

    // Validate input
    try {
      updateSkillSchema.parse(body)
    } catch (validationError: any) {
      return NextResponse.json(
        { error: validationError.errors?.[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('user_skills')
      .select('id, name')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }

    // Check name uniqueness if name is being changed
    if (body.name && body.name !== existing.name) {
      const { data: duplicate } = await supabase
        .from('user_skills')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', body.name)
        .neq('id', id)
        .single()

      if (duplicate) {
        return NextResponse.json(
          { error: 'A skill with this name already exists' },
          { status: 409 }
        )
      }
    }

    const { data: skill, error } = await supabase
      .from('user_skills')
      .update(body)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: 'Failed to update skill' }, { status: 500 })
    }

    return NextResponse.json({ data: skill })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/skills/[id] - Delete skill
export async function DELETE(
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

    // Get skill to delete file from storage
    const { data: skill } = await supabase
      .from('user_skills')
      .select('file_path')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }

    // Delete from database (cascade will delete embedding)
    const { error: dbError } = await supabase
      .from('user_skills')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (dbError) {
      console.error('Delete error:', dbError)
      return NextResponse.json({ error: 'Failed to delete skill' }, { status: 500 })
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('user-skills')
      .remove([skill.file_path])

    if (storageError) {
      console.error('Storage delete error:', storageError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
