import { createClient } from '@/lib/supabase/server'
import { ProjectsClient } from '@/components/projects/ProjectsClient'

// Disable caching for this page to ensure fresh data on navigation
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch first page of root-level items with total count
  const { data: items, count } = await supabase
    .from('project_items')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .is('parent_id', null)
    .order('type', { ascending: false }) // folders first
    .order('name', { ascending: true })
    .range(0, 15) // First 16 items (0-15)

  return <ProjectsClient initialItems={items || []} initialTotal={count || 0} />
}
