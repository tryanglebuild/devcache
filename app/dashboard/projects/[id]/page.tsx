import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProjectDetailClient } from '@/components/projects/ProjectDetailClient'

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

  // Get all items for this user to build the tree
  const { data: allItems } = await supabase
    .from('project_items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <ProjectDetailClient 
      project={project} 
      allItems={allItems || []} 
    />
  )
}
