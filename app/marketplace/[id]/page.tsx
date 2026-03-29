import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { AgentDetailClient } from '@/components/marketplace/AgentDetailClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface AgentDetailPageProps {
  params: { id: string }
}

export default async function AgentDetailPage({ params }: AgentDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch agent details
  const { data: agent, error } = await supabase
    .from('agent_templates')
    .select(`
      *,
      profiles (
        id,
        full_name,
        avatar_url,
        bio
      )
    `)
    .eq('id', id)
    .single()

  if (error || !agent) {
    console.error('Agent fetch error:', error)
    notFound()
  }

  // Extract profile data
  const profile = Array.isArray(agent.profiles) ? agent.profiles[0] : agent.profiles

  // Check if user has this agent
  let isInCollection = false
  let isFavorite = false
  let userRating = null

  if (user) {
    const { data: collection } = await supabase
      .from('agent_collections')
      .select('is_favorite')
      .eq('user_id', user.id)
      .eq('agent_id', id)
      .single()

    if (collection) {
      isInCollection = true
      isFavorite = collection.is_favorite || false
    }

    const { data: rating } = await supabase
      .from('agent_ratings')
      .select('rating, review')
      .eq('user_id', user.id)
      .eq('agent_id', id)
      .single()

    if (rating) {
      userRating = rating
    }
  }

  // Fetch ratings
  const { data: ratings } = await supabase
    .from('agent_ratings')
    .select(`
      *,
      profiles (
        full_name,
        avatar_url
      )
    `)
    .eq('agent_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch related agents (same category)
  const { data: relatedAgents } = await supabase
    .from('agent_templates')
    .select(`
      *,
      profiles (
        full_name
      )
    `)
    .eq('category', agent.category)
    .eq('visibility', 'public')
    .neq('id', id)
    .order('rating_average', { ascending: false })
    .limit(3)

  return (
    <AgentDetailClient
      agent={{
        ...agent,
        author_name: profile?.full_name || null,
        is_in_collection: isInCollection,
        is_favorite: isFavorite,
        user_rating: userRating?.rating || null
      }}
      ratings={ratings || []}
      relatedAgents={(relatedAgents || []).map(a => {
        const relatedProfile = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles
        return {
          ...a,
          author_name: relatedProfile?.full_name || null
        }
      })}
      isAuthenticated={!!user}
      currentUserId={user?.id}
    />
  )
}
