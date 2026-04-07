-- Fix embedding outdated detection logic
-- Add tolerance for timestamp comparison to avoid false positives

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
    LEFT JOIN agent_template_embeddings ate ON ate.agent_id = at.id
    WHERE at.deleted_at IS NULL
      AND at.visibility = 'public' -- Only process public agents in cron
      AND (
        ate.id IS NULL -- No embedding exists
        OR ate.embedding_vector IS NULL -- Embedding vector is null
        OR (ate.indexed_at + INTERVAL '2 seconds') < at.updated_at -- Embedding is outdated (with 2s tolerance)
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
      ARRAY[]::TEXT[] as tags,
      pi.user_id,
      pi.created_at,
      pi.updated_at
    FROM project_items pi
    WHERE pi.deleted_at IS NULL
      AND pi.type = 'file' -- Only files, not folders
      AND (
        pi.embedding_vector IS NULL -- No embedding exists
        OR pi.embedding_updated_at IS NULL -- Never been updated
        OR (pi.embedding_updated_at + INTERVAL '2 seconds') < pi.updated_at -- Embedding is outdated (with 2s tolerance)
      )
    ORDER BY pi.created_at DESC
    LIMIT p_limit / 2 -- Half for project items
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_embedding_stats function with same tolerance
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
     JOIN agent_template_embeddings ate ON ate.agent_id = at.id
     WHERE at.deleted_at IS NULL AND at.visibility = 'public'
     AND ate.embedding_vector IS NOT NULL
     AND (ate.indexed_at + INTERVAL '2 seconds') >= at.updated_at)::BIGINT,
    (SELECT COUNT(*) FROM agent_templates at
     LEFT JOIN agent_template_embeddings ate ON ate.agent_id = at.id
     WHERE at.deleted_at IS NULL AND at.visibility = 'public'
     AND (ate.id IS NULL OR ate.embedding_vector IS NULL OR (ate.indexed_at + INTERVAL '2 seconds') < at.updated_at))::BIGINT,
    
    -- Project item stats
    (SELECT COUNT(*) FROM project_items WHERE deleted_at IS NULL AND type = 'file')::BIGINT,
    (SELECT COUNT(*) FROM project_items 
     WHERE deleted_at IS NULL AND type = 'file' 
     AND embedding_vector IS NOT NULL
     AND embedding_updated_at IS NOT NULL
     AND (embedding_updated_at + INTERVAL '2 seconds') >= updated_at)::BIGINT,
    (SELECT COUNT(*) FROM project_items 
     WHERE deleted_at IS NULL AND type = 'file'
     AND (embedding_vector IS NULL OR embedding_updated_at IS NULL OR (embedding_updated_at + INTERVAL '2 seconds') < updated_at))::BIGINT,
    
    NOW() as last_check;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_pending_embeddings IS 
  'Returns all agent templates and project items that need embeddings generated or updated (with 2s tolerance for timestamp comparison)';

COMMENT ON FUNCTION get_embedding_stats IS 
  'Returns statistics about embedding coverage across agents and project items (with 2s tolerance for timestamp comparison)';
