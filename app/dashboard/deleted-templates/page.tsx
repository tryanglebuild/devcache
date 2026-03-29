import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DeletedTemplatesClient } from '@/components/agents/DeletedTemplatesClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DeletedTemplatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <DeletedTemplatesClient />
}
