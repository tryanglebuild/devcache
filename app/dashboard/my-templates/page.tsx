import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MyTemplatesClient } from '@/components/agents/MyTemplatesClient'
import { getUserCreatedAgents } from '@/lib/agents/queries'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MyTemplatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const templates = await getUserCreatedAgents(user.id)

  return <MyTemplatesClient initialTemplates={templates} />
}
