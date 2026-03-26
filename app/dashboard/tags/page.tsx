import { createClient } from '@/lib/supabase/server'
import { TagsClient } from '@/components/tags/TagsClient'

export default async function TagsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: tags } = await supabase
    .from('language_tags')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  return <TagsClient initialTags={tags || []} />
}
