-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- ============================================
-- Function: get_pending_embeddings
-- Returns all items that need embeddings generated
-- ============================================
CREATE OR REPLACE FUNCTION get_pending_embeddings(
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  name TEXT,
  description TEXT,
  content TEXT,
  tags TEXT[],
  user_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  (
    -- Agent templates without embeddings or outdated embeddings
    SELECT 
      at.id,
      'agent'::TEXT as type,
      at.name,
      at.description,
      at.content,
      at.tags,
      at.user_id,
      at.created_at,
      at.updated_at
    FROM agent_templates at
    LEFT JOIN agent_template_embeddings ate ON ate.template_id = at.id
    WHERE at.deleted_at IS NULL
      AND at.visibility = 'public' -- Only process public agents in cron
      AND (
        ate.id IS NULL -- No embedding exists
        OR ate.updated_at < at.updated_at -- Embedding is outdated
        OR ate.embedding_vector IS NULL -- Embedding vector is null
      )
    ORDER BY at.created_at DESC
    LIMIT p_limit / 2 -- Half for agents
  )
  UNION ALL
  (
    -- Project items without embeddings or outdated embeddings
    SELECT 
      pi.id,
      'project'::TEXT as type,
      pi.name,
      pi.description,
      pi.content,
      ARRAY(
        SELECT t.name 
        FROM project_item_tags pit
        JOIN tags t ON t.id = pit.tag_id
        WHERE pit.project_item_id = pi.id
      ) as tags,
      pi.user_id,
      pi.created_at,
      pi.updated_at
    FROM project_items pi
    WHERE pi.deleted_at IS NULL
      AND pi.type = 'file' -- Only files, not folders
      AND (
        pi.embedding_vector IS NULL -- No embedding exists
        OR pi.embedding_updated_at IS NULL -- Never been updated
        OR pi.embedding_updated_at < pi.updated_at -- Embedding is outdated
      )
    ORDER BY pi.created_at DESC
    LIMIT p_limit / 2 -- Half for project items
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: get_embedding_stats
-- Returns statistics about embedding coverage
-- ============================================
CREATE OR REPLACE FUNCTION get_embedding_stats()
RETURNS TABLE (
  total_agents BIGINT,
  agents_with_embeddings BIGINT,
  agents_pending BIGINT,
  total_project_items BIGINT,
  project_items_with_embeddings BIGINT,
  project_items_pending BIGINT,
  last_check TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Agent stats
    (SELECT COUNT(*) FROM agent_templates WHERE deleted_at IS NULL AND visibility = 'public')::BIGINT,
    (SELECT COUNT(*) FROM agent_templates at
     JOIN agent_template_embeddings ate ON ate.template_id = at.id
     WHERE at.deleted_at IS NULL AND at.visibility = 'public'
     AND ate.embedding_vector IS NOT NULL)::BIGINT,
    (SELECT COUNT(*) FROM agent_templates at
     LEFT JOIN agent_template_embeddings ate ON ate.template_id = at.id
     WHERE at.deleted_at IS NULL AND at.visibility = 'public'
     AND (ate.id IS NULL OR ate.embedding_vector IS NULL OR ate.updated_at < at.updated_at))::BIGINT,
    
    -- Project item stats
    (SELECT COUNT(*) FROM project_items WHERE deleted_at IS NULL AND type = 'file')::BIGINT,
    (SELECT COUNT(*) FROM project_items 
     WHERE deleted_at IS NULL AND type = 'file' 
     AND embedding_vector IS NOT NULL)::BIGINT,
    (SELECT COUNT(*) FROM project_items 
     WHERE deleted_at IS NULL AND type = 'file'
     AND (embedding_vector IS NULL OR embedding_updated_at IS NULL OR embedding_updated_at < updated_at))::BIGINT,
    
    NOW() as last_check;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: log_embedding_cron_run
-- Logs cron job execution for monitoring
-- ============================================
CREATE TABLE IF NOT EXISTS embedding_cron_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at TIMESTAMPTZ DEFAULT NOW(),
  items_processed INTEGER DEFAULT 0,
  items_succeeded INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  execution_time_ms INTEGER,
  error_message TEXT,
  stats JSONB
);

CREATE INDEX IF NOT EXISTS idx_embedding_cron_logs_run_at 
ON embedding_cron_logs(run_at DESC);

CREATE OR REPLACE FUNCTION log_embedding_cron_run(
  p_items_processed INTEGER,
  p_items_succeeded INTEGER,
  p_items_failed INTEGER,
  p_execution_time_ms INTEGER,
  p_error_message TEXT DEFAULT NULL,
  p_stats JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO embedding_cron_logs (
    items_processed,
    items_succeeded,
    items_failed,
    execution_time_ms,
    error_message,
    stats
  ) VALUES (
    p_items_processed,
    p_items_succeeded,
    p_items_failed,
    p_execution_time_ms,
    p_error_message,
    p_stats
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Schedule weekly cron job
-- Runs every Sunday at 2 AM UTC
-- ============================================
SELECT cron.schedule(
  'weekly-embedding-check',           -- Job name
  '0 2 * * 0',                        -- Cron expression: Every Sunday at 2 AM
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/cron-generate-embeddings',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key')
    ),
    body := jsonb_build_object(
      'scheduled', true,
      'max_items', 100
    )
  );
  $$
);

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON FUNCTION get_pending_embeddings IS 
  'Returns all agent templates and project items that need embeddings generated or updated';

COMMENT ON FUNCTION get_embedding_stats IS 
  'Returns statistics about embedding coverage across agents and project items';

COMMENT ON FUNCTION log_embedding_cron_run IS 
  'Logs cron job execution for monitoring and debugging';

COMMENT ON TABLE embedding_cron_logs IS 
  'Stores logs of weekly embedding cron job executions';

-- ============================================
-- Grant permissions
-- ============================================
GRANT EXECUTE ON FUNCTION get_pending_embeddings TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_embedding_stats TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION log_embedding_cron_run TO service_role;
GRANT SELECT ON embedding_cron_logs TO authenticated;
GRANT ALL ON embedding_cron_logs TO service_role;
