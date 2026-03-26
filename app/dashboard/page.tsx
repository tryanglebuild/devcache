import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Welcome to devCache</h1>
        <p className="text-on-surface-variant mb-8">
          You're logged in as {user.email}
        </p>
        
        <div className="glass-panel p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
          <p className="text-on-surface-variant">
            Your dashboard content will appear here.
          </p>
        </div>
      </div>
    </div>
  )
}
