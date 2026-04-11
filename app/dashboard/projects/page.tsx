import { createClient } from '@/lib/supabase/server'
import { ProjectsClient } from '@/components/projects/ProjectsClient'

// Disable caching for this page to ensure fresh data on navigation
export const dynamic = 'force-dynamic'
export const revalidate = 0

const ITEMS_PER_PAGE = 16

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch only root-level items (parent_id = null) for the first page
  const { data: items, count } = await supabase
    .from('project_items')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .is('parent_id', null)
    .is('deleted_at', null)
    .order('type', { ascending: false }) // folders first
    .order('name', { ascending: true })
    .range(0, ITEMS_PER_PAGE - 1)

  return <ProjectsClient initialItems={items || []} initialTotal={count || 0} />
}
