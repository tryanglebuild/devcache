/**
 * Analytics Tracking System
 * 
 * Tracks user interactions and agent usage for analytics
 */

import { createClient } from '@/lib/supabase/client'

export type AnalyticsEvent =
  // Agent events
  | 'agent_view'
  | 'agent_download'
  | 'agent_execute'
  | 'agent_rate'
  | 'agent_share'
  | 'agent_favorite'
  // Marketplace events
  | 'marketplace_search'
  | 'marketplace_filter'
  | 'marketplace_category_view'
  // User events
  | 'user_signup'
  | 'user_login'
  | 'profile_update'
  // Template events
  | 'template_create'
  | 'template_update'
  | 'template_delete'
  | 'template_publish'
  // Workflow events
  | 'workflow_create'
  | 'workflow_execute'
  // Search events
  | 'search_query'
  | 'search_result_click'

export interface AnalyticsEventData {
  event: AnalyticsEvent
  properties?: Record<string, any>
  timestamp?: Date
}

/**
 * Track analytics event
 */
export async function trackEvent(
  event: AnalyticsEvent,
  properties?: Record<string, any>
): Promise<void> {
  try {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    // Prepare event data
    const eventData = {
      user_id: user?.id || null,
      event_type: event,
      event_properties: properties || {},
      created_at: new Date().toISOString(),
      // Add session info
      session_id: getSessionId(),
      user_agent: navigator.userAgent,
      referrer: document.referrer,
      page_url: window.location.href,
    }

    // Send to analytics table
    const { error } = await supabase
      .from('analytics_events')
      .insert(eventData)

    if (error) {
      console.error('Analytics tracking error:', error)
    }
  } catch (error) {
    // Fail silently - don't break user experience
    console.error('Failed to track analytics event:', error)
  }
}

/**
 * Track page view
 */
export async function trackPageView(pageName: string, properties?: Record<string, any>): Promise<void> {
  await trackEvent('search_query', {
    page_name: pageName,
    ...properties,
  })
}

/**
 * Track agent interaction
 */
export async function trackAgentInteraction(
  agentId: string,
  action: 'view' | 'download' | 'execute' | 'rate' | 'share' | 'favorite',
  metadata?: Record<string, any>
): Promise<void> {
  const eventMap = {
    view: 'agent_view',
    download: 'agent_download',
    execute: 'agent_execute',
    rate: 'agent_rate',
    share: 'agent_share',
    favorite: 'agent_favorite',
  } as const

  await trackEvent(eventMap[action], {
    agent_id: agentId,
    ...metadata,
  })
}

/**
 * Track search query
 */
export async function trackSearch(
  query: string,
  filters?: Record<string, any>,
  resultsCount?: number
): Promise<void> {
  await trackEvent('search_query', {
    query,
    filters,
    results_count: resultsCount,
  })
}

/**
 * Track marketplace interaction
 */
export async function trackMarketplace(
  action: 'search' | 'filter' | 'category_view',
  metadata?: Record<string, any>
): Promise<void> {
  const eventMap = {
    search: 'marketplace_search',
    filter: 'marketplace_filter',
    category_view: 'marketplace_category_view',
  } as const

  await trackEvent(eventMap[action], metadata)
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  const SESSION_KEY = 'analytics_session_id'
  const SESSION_DURATION = 30 * 60 * 1000 // 30 minutes

  let sessionData = localStorage.getItem(SESSION_KEY)
  
  if (sessionData) {
    const { id, timestamp } = JSON.parse(sessionData)
    
    // Check if session is still valid
    if (Date.now() - timestamp < SESSION_DURATION) {
      return id
    }
  }

  // Create new session
  const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      id: newSessionId,
      timestamp: Date.now(),
    })
  )

  return newSessionId
}

/**
 * Batch tracking for performance
 */
class AnalyticsBatcher {
  private queue: AnalyticsEventData[] = []
  private batchSize = 10
  private flushInterval = 5000 // 5 seconds
  private timer: NodeJS.Timeout | null = null

  constructor() {
    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush())
    }
  }

  add(event: AnalyticsEvent, properties?: Record<string, any>) {
    this.queue.push({
      event,
      properties,
      timestamp: new Date(),
    })

    if (this.queue.length >= this.batchSize) {
      this.flush()
    } else if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.flushInterval)
    }
  }

  async flush() {
    if (this.queue.length === 0) return

    const events = [...this.queue]
    this.queue = []

    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const eventData = events.map(e => ({
        user_id: user?.id || null,
        event_type: e.event,
        event_properties: e.properties || {},
        created_at: e.timestamp?.toISOString() || new Date().toISOString(),
        session_id: getSessionId(),
      }))

      await supabase.from('analytics_events').insert(eventData)
    } catch (error) {
      console.error('Failed to flush analytics batch:', error)
    }
  }
}

// Export singleton instance
export const analyticsBatcher = new AnalyticsBatcher()

/**
 * Track event with batching
 */
export function trackEventBatched(
  event: AnalyticsEvent,
  properties?: Record<string, any>
): void {
  analyticsBatcher.add(event, properties)
}
