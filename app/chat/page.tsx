import { ChatPageClient } from '@/components/chat/ChatPageClient'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'AI Chat | DevCache',
  description: 'Chat with AI assistant to find templates and get help',
}

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return <ChatPageClient />
}
