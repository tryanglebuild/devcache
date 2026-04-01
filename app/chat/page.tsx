import { ChatPageClient } from '@/components/chat/ChatPageClient'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
