import { createClient } from '@/lib/supabase/server'
import type { AgentTemplateWithStats, MarketplaceStats, UserAgentStats } from '@/types/agents.types'

export async function getTrendingAgents(limit: number = 10): Promise<AgentTemplateWithStats[]> {
  const supabase = await createClient()
  
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const { data, error } = await supabase
    .from('agent_templates')
    .select(`
      *,
      profiles:user_id (
        full_name
      )
    `)
    .eq('visibility', 'public')
    .gte('updated_at', sevenDaysAgo.toISOString())
    .order('download_count', { ascending: false })
    .order('rating_average', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching trending agents:', error)
    return []
  }
  
  return (data || []).map(agent => ({
    ...agent,
    author_name: agent.profiles?.full_name || null
  }))
}

export async function getUserAgentCollection(userId: string): Promise<AgentTemplateWithStats[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('agent_collections')
    .select(`
      is_favorite,
      agent_templates (
        *,
        profiles:user_id (
          full_name
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching user collection:', error)
    return []
  }
  
  return (data || [])
    .filter(item => item.agent_templates)
    .map(item => {
      const template = item.agent_templates as any
      return {
        ...template,
        is_favorite: item.is_favorite,
        is_in_collection: true,
        author_name: template.profiles?.full_name || null
      }
    }) as AgentTemplateWithStats[]
}

export async function getMarketplaceStats(): Promise<MarketplaceStats | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('get_marketplace_stats')
  
  if (error) {
    console.error('Error fetching marketplace stats:', error)
    return null
  }
  
  return data?.[0] || null
}

export async function getUserAgentStats(userId: string): Promise<UserAgentStats | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('get_user_agent_stats', {
    p_user_id: userId
  })
  
  if (error) {
    console.error('Error fetching user stats:', error)
    return null
  }
  
  return data?.[0] || null
}

export async function getPublicAgents(limit: number = 20): Promise<AgentTemplateWithStats[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('agent_templates')
    .select('*')
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching public agents:', error)
    return []
  }

  if (!data || data.length === 0) {
    return []
  }

  // Fetch author names separately
  const userIds = [...new Set(data.map(a => a.user_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds)

  const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || [])
  
  return data.map(agent => ({
    ...agent,
    author_name: profileMap.get(agent.user_id) || null
  }))
}
