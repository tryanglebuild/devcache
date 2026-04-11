import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProjectDetailClient } from '@/components/projects/ProjectDetailClient'

// Disable caching for this page to ensure fresh data on navigation
export const dynamic = 'force-dynamic'
export const revalidate = 0

const ITEMS_PER_PAGE = 16

export default async function ProjectDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get the project item
  const { data: project, error: projectError } = await supabase
    .from('project_items')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (projectError || !project) {
    redirect('/dashboard/projects')
  }

  // Get only direct children of this folder, paginated (first page)
  const { data: childItems, count: childCount } = await supabase
    .from('project_items')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('parent_id', id)
    .is('deleted_at', null)
    .order('type', { ascending: false }) // folders first
    .order('name', { ascending: true })
    .range(0, ITEMS_PER_PAGE - 1)

  return (
    <ProjectDetailClient 
      project={project} 
      initialItems={childItems || []}
      initialTotal={childCount || 0}
    />
  )
}
