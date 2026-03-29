import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/agents/deleted - List user's deleted templates
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data, error } = await supabase
      .from('deleted_agent_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('deleted_at', { ascending: false })
    
    if (error) {
      console.error('Get deleted templates error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Calculate days remaining for each template
    const templatesWithExpiry = data.map(template => {
      const deletedDate = new Date(template.deleted_at)
      const expiryDate = new Date(deletedDate.getTime() + 30 * 24 * 60 * 60 * 1000)
      const daysRemaining = Math.ceil((expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
      
      return {
        ...template,
        days_remaining: Math.max(0, daysRemaining),
        expires_at: expiryDate.toISOString()
      }
    })
    
    return NextResponse.json(templatesWithExpiry)
  } catch (error) {
    console.error('GET /api/agents/deleted error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
