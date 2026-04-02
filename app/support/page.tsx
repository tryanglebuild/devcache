import { createClient } from '@/lib/supabase/server'
import { SupportPageClient } from '@/components/support/SupportPageClient'

export const metadata = {
  title: 'Support & Help Center | DevCache',
  description: 'Tutorials, guides, and Q&A to help you master DevCache',
}

export default async function SupportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <SupportPageClient isAuthenticated={!!user} />
}
