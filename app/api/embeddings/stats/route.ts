import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get total templates for user
    const { count: totalTemplates } = await supabase
      .from('agent_templates')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Get user's template IDs
    const { data: userTemplates } = await supabase
      .from('agent_templates')
      .select('id')
      .eq('user_id', user.id)

    const templateIds = userTemplates?.map(t => t.id) || []

    // Get templates with embeddings
    const { count: withEmbeddings } = await supabase
      .from('agent_template_embeddings')
      .select('agent_id', { count: 'exact', head: true })
      .in('agent_id', templateIds)

    // Get last indexed timestamp
    const { data: lastIndexed } = await supabase
      .from('agent_template_embeddings')
      .select('indexed_at')
      .in('agent_id', templateIds)
      .order('indexed_at', { ascending: false })
      .limit(1)
      .single()

    const total = totalTemplates || 0
    const indexed = withEmbeddings || 0

    return NextResponse.json({
      total_templates: total,
      templates_with_embeddings: indexed,
      templates_needing_embeddings: total - indexed,
      last_indexed_at: lastIndexed?.indexed_at || null,
    })
  } catch (error) {
    console.error('Error fetching embeddings stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
