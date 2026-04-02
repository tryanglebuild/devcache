/**
 * Analytics Query Functions
 * 
 * Functions to retrieve analytics data from the database
 */

import { createClient } from '@/lib/supabase/server'

export interface AgentAnalytics {
  agent_id: string
  total_views: number
  total_downloads: number
  total_executions: number
  total_ratings: number
  average_rating: number
  unique_users: number
  trend_7d: number // Percentage change from previous 7 days
}

export interface UserAnalytics {
  user_id: string
  total_agents_created: number
  total_agents_published: number
  total_downloads_received: number
  total_executions: number
  average_rating: number
  active_days: number
}

export interface MarketplaceAnalytics {
  total_agents: number
  total_downloads: number
  total_executions: number
  total_searches: number
  popular_categories: Array<{ category: string; count: number }>
  popular_tags: Array<{ tag: string; count: number }>
  trending_agents: Array<{ agent_id: string; name: string; score: number }>
}

/**
 * Get analytics for a specific agent
 */
export async function getAgentAnalytics(agentId: string): Promise<AgentAnalytics | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_agent_analytics', {
    p_agent_id: agentId,
  })

  if (error) {
    console.error('Error fetching agent analytics:', error)
    return null
  }

  return data
}

/**
 * Get analytics for current user
 */
export async function getUserAnalytics(): Promise<UserAnalytics | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase.rpc('get_user_analytics', {
    p_user_id: user.id,
  })

  if (error) {
    console.error('Error fetching user analytics:', error)
    return null
  }

  return data
}

/**
 * Get marketplace-wide analytics
 */
export async function getMarketplaceAnalytics(): Promise<MarketplaceAnalytics | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_marketplace_analytics')

  if (error) {
    console.error('Error fetching marketplace analytics:', error)
    return null
  }

  return data
}

/**
 * Get trending agents based on recent activity
 */
export async function getTrendingAgents(limit: number = 10): Promise<any[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_trending_agents', {
    p_limit: limit,
  })

  if (error) {
    console.error('Error fetching trending agents:', error)
    return []
  }

  return data || []
}

/**
 * Get analytics time series data
 */
export async function getAnalyticsTimeSeries(
  agentId: string,
  metric: 'views' | 'downloads' | 'executions',
  days: number = 30
): Promise<Array<{ date: string; value: number }>> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_analytics_time_series', {
    p_agent_id: agentId,
    p_metric: metric,
    p_days: days,
  })

  if (error) {
    console.error('Error fetching time series:', error)
    return []
  }

  return data || []
}

/**
 * Get search analytics
 */
export async function getSearchAnalytics(days: number = 7): Promise<{
  total_searches: number
  top_queries: Array<{ query: string; count: number }>
  avg_results_per_search: number
}> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_search_analytics', {
    p_days: days,
  })

  if (error) {
    console.error('Error fetching search analytics:', error)
    return {
      total_searches: 0,
      top_queries: [],
      avg_results_per_search: 0,
    }
  }

  return data
}

/**
 * Get user engagement metrics
 */
export async function getUserEngagement(userId: string): Promise<{
  daily_active_days: number
  weekly_active_days: number
  monthly_active_days: number
  avg_session_duration: number
  total_sessions: number
}> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_user_engagement', {
    p_user_id: userId,
  })

  if (error) {
    console.error('Error fetching user engagement:', error)
    return {
      daily_active_days: 0,
      weekly_active_days: 0,
      monthly_active_days: 0,
      avg_session_duration: 0,
      total_sessions: 0,
    }
  }

  return data
}
