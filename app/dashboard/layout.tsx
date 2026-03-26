import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayoutClient } from './layout-client'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User'
  const jobTitle = profile?.job_title || 'Developer'

  return (
    <DashboardLayoutClient 
      displayName={displayName} 
      jobTitle={jobTitle}
      email={user.email || ''}
      createdAt={user.created_at}
    >
      {children}
    </DashboardLayoutClient>
  )
}
