// Skills Content API - Get skill file content
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    // Get skill file path
    const { data: skill } = await supabase
      .from('user_skills')
      .select('file_path, name')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }

    // Download from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('user-skills')
      .download(skill.file_path)

    if (downloadError || !fileData) {
      console.error('Download error:', downloadError)
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
    }

    const content = await fileData.text()

    return NextResponse.json({ 
      data: { 
        content,
        name: skill.name,
        file_path: skill.file_path
      } 
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
