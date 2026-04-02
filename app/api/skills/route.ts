// Skills API - List and Create
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { CreateSkillRequest } from '@/types/skills'
import { createSkillSchema } from '@/lib/validations/skills'

// GET /api/skills - List user's skills
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'
    const category = searchParams.get('category')

    let query = supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', user.id)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data: skills, error } = await query

    if (error) {
      console.error('Error fetching skills:', error)
      return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 })
    }

    return NextResponse.json({ skills })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/skills - Create new skill
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateSkillRequest = await request.json()

    // Validate input
    try {
      createSkillSchema.parse(body)
    } catch (validationError: any) {
      return NextResponse.json(
        { error: validationError.errors?.[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    if (!body.name || !body.content) {
      return NextResponse.json(
        { error: 'Name and content are required' },
        { status: 400 }
      )
    }

    // Check name uniqueness
    const { data: existing } = await supabase
      .from('user_skills')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', body.name)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'A skill with this name already exists' },
        { status: 409 }
      )
    }

    const skillId = crypto.randomUUID()
    const fileName = `${skillId}_${body.name.toLowerCase().replace(/\s+/g, '-')}.md`
    const filePath = `${user.id}/${fileName}`

    // Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from('user-skills')
      .upload(filePath, body.content, {
        contentType: 'text/markdown',
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload skill file' },
        { status: 500 }
      )
    }

    // Create database record
    const { data: skill, error: dbError } = await supabase
      .from('user_skills')
      .insert({
        id: skillId,
        user_id: user.id,
        name: body.name,
        description: body.description || null,
        file_path: filePath,
        file_size: new Blob([body.content]).size,
        category: body.category || 'general',
        tags: body.tags || [],
        priority: body.priority || 0,
        is_active: true,
      })
      .select()
      .single()

    if (dbError) {
      // Rollback: delete uploaded file
      await supabase.storage.from('user-skills').remove([filePath])
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to create skill' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: skill }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
