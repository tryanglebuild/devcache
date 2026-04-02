-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_properties JSONB DEFAULT '{}'::jsonb,
  session_id TEXT,
  user_agent TEXT,
  referrer TEXT,
  page_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_properties ON analytics_events USING gin(event_properties);

-- RLS Policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own analytics
CREATE POLICY "Users can view own analytics"
ON analytics_events FOR SELECT
USING (auth.uid() = user_id);

-- System can insert analytics (service role)
CREATE POLICY "System can insert analytics"
ON analytics_events FOR INSERT
WITH CHECK (true);

-- Function: Get agent analytics
CREATE OR REPLACE FUNCTION get_agent_analytics(p_agent_id UUID)
RETURNS TABLE (
  agent_id UUID,
  total_views BIGINT,
  total_downloads BIGINT,
  total_executions BIGINT,
  total_ratings BIGINT,
  average_rating NUMERIC,
  unique_users BIGINT,
  trend_7d NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH current_period AS (
    SELECT
      COUNT(*) FILTER (WHERE event_type = 'agent_view') as views,
      COUNT(*) FILTER (WHERE event_type = 'agent_download') as downloads,
      COUNT(*) FILTER (WHERE event_type = 'agent_execute') as executions,
      COUNT(DISTINCT user_id) as users
    FROM analytics_events
    WHERE event_properties->>'agent_id' = p_agent_id::text
      AND created_at >= NOW() - INTERVAL '7 days'
  ),
  previous_period AS (
    SELECT
      COUNT(*) FILTER (WHERE event_type = 'agent_view') as views
    FROM analytics_events
    WHERE event_properties->>'agent_id' = p_agent_id::text
      AND created_at >= NOW() - INTERVAL '14 days'
      AND created_at < NOW() - INTERVAL '7 days'
  ),
  ratings AS (
    SELECT
      COUNT(*) as total,
      AVG((event_properties->>'rating')::numeric) as avg_rating
    FROM analytics_events
    WHERE event_type = 'agent_rate'
      AND event_properties->>'agent_id' = p_agent_id::text
  )
  SELECT
    p_agent_id,
    COALESCE(cp.views, 0)::BIGINT,
    COALESCE(cp.downloads, 0)::BIGINT,
    COALESCE(cp.executions, 0)::BIGINT,
    COALESCE(r.total, 0)::BIGINT,
    COALESCE(r.avg_rating, 0)::NUMERIC,
    COALESCE(cp.users, 0)::BIGINT,
    CASE 
      WHEN COALESCE(pp.views, 0) = 0 THEN 0
      ELSE ((COALESCE(cp.views, 0) - COALESCE(pp.views, 0))::NUMERIC / COALESCE(pp.views, 1) * 100)
    END as trend_7d
  FROM current_period cp
  CROSS JOIN previous_period pp
  CROSS JOIN ratings r;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user analytics
CREATE OR REPLACE FUNCTION get_user_analytics(p_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  total_agents_created BIGINT,
  total_agents_published BIGINT,
  total_downloads_received BIGINT,
  total_executions BIGINT,
  average_rating NUMERIC,
  active_days BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p_user_id,
    (SELECT COUNT(*) FROM agent_templates WHERE user_id = p_user_id)::BIGINT,
    (SELECT COUNT(*) FROM agent_templates WHERE user_id = p_user_id AND visibility = 'public')::BIGINT,
    (SELECT COALESCE(SUM(download_count), 0) FROM agent_templates WHERE user_id = p_user_id)::BIGINT,
    (SELECT COUNT(*) FROM analytics_events 
     WHERE user_id = p_user_id AND event_type = 'agent_execute')::BIGINT,
    (SELECT COALESCE(AVG(rating_average), 0) FROM agent_templates WHERE user_id = p_user_id)::NUMERIC,
    (SELECT COUNT(DISTINCT DATE(created_at)) FROM analytics_events WHERE user_id = p_user_id)::BIGINT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get marketplace analytics
CREATE OR REPLACE FUNCTION get_marketplace_analytics()
RETURNS TABLE (
  total_agents BIGINT,
  total_downloads BIGINT,
  total_executions BIGINT,
  total_searches BIGINT,
  popular_categories JSONB,
  popular_tags JSONB,
  trending_agents JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM agent_templates WHERE visibility = 'public')::BIGINT,
    (SELECT COUNT(*) FROM analytics_events WHERE event_type = 'agent_download')::BIGINT,
    (SELECT COUNT(*) FROM analytics_events WHERE event_type = 'agent_execute')::BIGINT,
    (SELECT COUNT(*) FROM analytics_events WHERE event_type = 'search_query')::BIGINT,
    (SELECT COALESCE(jsonb_agg(jsonb_build_object('category', category, 'count', cnt)), '[]'::jsonb)
     FROM (
       SELECT category, COUNT(*) as cnt
       FROM agent_templates
       WHERE visibility = 'public'
       GROUP BY category
       ORDER BY cnt DESC
       LIMIT 10
     ) cats)::JSONB,
    (SELECT COALESCE(jsonb_agg(jsonb_build_object('tag', tag, 'count', cnt)), '[]'::jsonb)
     FROM (
       SELECT unnest(tags) as tag, COUNT(*) as cnt
       FROM agent_templates
       WHERE visibility = 'public'
       GROUP BY tag
       ORDER BY cnt DESC
       LIMIT 20
     ) tags_data)::JSONB,
    (SELECT COALESCE(jsonb_agg(jsonb_build_object('agent_id', agent_id, 'name', name, 'score', score)), '[]'::jsonb)
     FROM (
       SELECT 
         at.id as agent_id,
         at.name,
         (COUNT(DISTINCT ae.id) * 2 + at.download_count) as score
       FROM agent_templates at
       LEFT JOIN analytics_events ae ON ae.event_properties->>'agent_id' = at.id::text
         AND ae.created_at >= NOW() - INTERVAL '7 days'
       WHERE at.visibility = 'public'
       GROUP BY at.id, at.name, at.download_count
       ORDER BY score DESC
       LIMIT 10
     ) trending)::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get trending agents
CREATE OR REPLACE FUNCTION get_trending_agents(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  agent_id UUID,
  name TEXT,
  description TEXT,
  category TEXT,
  rating_average NUMERIC,
  download_count INTEGER,
  trend_score BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    at.id,
    at.name,
    at.description,
    at.category,
    at.rating_average,
    at.download_count,
    (COUNT(DISTINCT ae.id) * 2 + at.download_count)::BIGINT as trend_score
  FROM agent_templates at
  LEFT JOIN analytics_events ae ON ae.event_properties->>'agent_id' = at.id::text
    AND ae.created_at >= NOW() - INTERVAL '7 days'
    AND ae.event_type IN ('agent_view', 'agent_download', 'agent_execute')
  WHERE at.visibility = 'public'
  GROUP BY at.id, at.name, at.description, at.category, at.rating_average, at.download_count
  ORDER BY trend_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get analytics time series
CREATE OR REPLACE FUNCTION get_analytics_time_series(
  p_agent_id UUID,
  p_metric TEXT,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  value BIGINT
) AS $$
DECLARE
  event_type_filter TEXT;
BEGIN
  -- Map metric to event type
  event_type_filter := CASE p_metric
    WHEN 'views' THEN 'agent_view'
    WHEN 'downloads' THEN 'agent_download'
    WHEN 'executions' THEN 'agent_execute'
    ELSE 'agent_view'
  END;

  RETURN QUERY
  SELECT
    DATE(created_at) as date,
    COUNT(*)::BIGINT as value
  FROM analytics_events
  WHERE event_properties->>'agent_id' = p_agent_id::text
    AND event_type = event_type_filter
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get search analytics
CREATE OR REPLACE FUNCTION get_search_analytics(p_days INTEGER DEFAULT 7)
RETURNS TABLE (
  total_searches BIGINT,
  top_queries JSONB,
  avg_results_per_search NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    (SELECT COALESCE(jsonb_agg(jsonb_build_object('query', query, 'count', cnt)), '[]'::jsonb)
     FROM (
       SELECT 
         event_properties->>'query' as query,
         COUNT(*) as cnt
       FROM analytics_events
       WHERE event_type = 'search_query'
         AND created_at >= NOW() - (p_days || ' days')::INTERVAL
         AND event_properties->>'query' IS NOT NULL
       GROUP BY event_properties->>'query'
       ORDER BY cnt DESC
       LIMIT 20
     ) queries)::JSONB,
    (SELECT COALESCE(AVG((event_properties->>'results_count')::numeric), 0)
     FROM analytics_events
     WHERE event_type = 'search_query'
       AND created_at >= NOW() - (p_days || ' days')::INTERVAL
       AND event_properties->>'results_count' IS NOT NULL)::NUMERIC
  FROM analytics_events
  WHERE event_type = 'search_query'
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user engagement
CREATE OR REPLACE FUNCTION get_user_engagement(p_user_id UUID)
RETURNS TABLE (
  daily_active_days BIGINT,
  weekly_active_days BIGINT,
  monthly_active_days BIGINT,
  avg_session_duration NUMERIC,
  total_sessions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(DISTINCT DATE(created_at))
     FROM analytics_events
     WHERE user_id = p_user_id
       AND created_at >= NOW() - INTERVAL '1 day')::BIGINT,
    (SELECT COUNT(DISTINCT DATE(created_at))
     FROM analytics_events
     WHERE user_id = p_user_id
       AND created_at >= NOW() - INTERVAL '7 days')::BIGINT,
    (SELECT COUNT(DISTINCT DATE(created_at))
     FROM analytics_events
     WHERE user_id = p_user_id
       AND created_at >= NOW() - INTERVAL '30 days')::BIGINT,
    0::NUMERIC, -- Placeholder for avg session duration
    (SELECT COUNT(DISTINCT session_id)
     FROM analytics_events
     WHERE user_id = p_user_id)::BIGINT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_agent_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_marketplace_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_trending_agents TO authenticated;
GRANT EXECUTE ON FUNCTION get_analytics_time_series TO authenticated;
GRANT EXECUTE ON FUNCTION get_search_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_engagement TO authenticated;

-- Comments
COMMENT ON TABLE analytics_events IS 'Stores all analytics events for tracking user behavior and agent usage';
COMMENT ON FUNCTION get_agent_analytics IS 'Returns comprehensive analytics for a specific agent';
COMMENT ON FUNCTION get_user_analytics IS 'Returns analytics for a specific user';
COMMENT ON FUNCTION get_marketplace_analytics IS 'Returns marketplace-wide analytics';
