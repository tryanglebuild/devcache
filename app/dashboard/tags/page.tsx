import { createClient } from '@/lib/supabase/server'
import { TagsClient } from '@/components/tags/TagsClient'

export default async function TagsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch tags
  const { data: tags } = await supabase
    .from('user_tags')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  // Fetch all project items to calculate tag usage (exclude soft-deleted)
  const { data: projectItems } = await supabase
    .from('project_items')
    .select('language_tags')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .not('language_tags', 'is', null)

  // Calculate tag statistics
  const tagStats: Record<string, number> = {}
  projectItems?.forEach(item => {
    item.language_tags?.forEach((tagName: string) => {
      tagStats[tagName] = (tagStats[tagName] || 0) + 1
    })
  })

  return <TagsClient initialTags={tags || []} tagStats={tagStats} />
}
