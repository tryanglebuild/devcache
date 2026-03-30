-- Create intelligent search function for AI chat
-- This function searches across project_items and agent_templates with relevance scoring

CREATE OR REPLACE FUNCTION search_resources(
  p_user_id UUID,
  p_query TEXT,
  p_include_marketplace BOOLEAN DEFAULT TRUE,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  resource_type TEXT,
  resource_id UUID,
  name TEXT,
  description TEXT,
  tags TEXT[],
  content_preview TEXT,
  relevance_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH project_results AS (
    -- Search user's project items
    SELECT
      'project_item'::TEXT as resource_type,
      pi.id as resource_id,
      pi.name,
      pi.description,
      ARRAY(
        SELECT t.name 
        FROM tags t 
        JOIN project_item_tags pit ON pit.tag_id = t.id 
        WHERE pit.project_item_id = pi.id
      ) as tags,
      LEFT(COALESCE(pi.content, ''), 200) as content_preview,
      (
        -- Text search score
        ts_rank(
          to_tsvector('english', 
            COALESCE(pi.name, '') || ' ' || 
            COALESCE(pi.description, '') || ' ' ||
            COALESCE(pi.content, '')
          ),
          plainto_tsquery('english', p_query)
        ) * 2.0 +
        -- Boost for name matches
        CASE WHEN pi.name ILIKE '%' || p_query || '%' THEN 1.0 ELSE 0.0 END +
        -- Boost for recent items
        CASE 
          WHEN pi.updated_at > NOW() - INTERVAL '7 days' THEN 0.5
          WHEN pi.updated_at > NOW() - INTERVAL '30 days' THEN 0.3
          ELSE 0.0
        END +
        -- Boost for favorited items
        CASE WHEN pi.is_favorited THEN 0.3 ELSE 0.0 END
      )::DECIMAL as relevance_score
    FROM project_items pi
    WHERE pi.user_id = p_user_id
      AND pi.deleted_at IS NULL
      AND (
        to_tsvector('english', 
          COALESCE(pi.name, '') || ' ' || 
          COALESCE(pi.description, '') || ' ' ||
          COALESCE(pi.content, '')
        ) @@ plainto_tsquery('english', p_query)
        OR pi.name ILIKE '%' || p_query || '%'
        OR pi.description ILIKE '%' || p_query || '%'
        OR EXISTS (
          SELECT 1 FROM tags t
          JOIN project_item_tags pit ON pit.tag_id = t.id
          WHERE pit.project_item_id = pi.id
          AND t.name ILIKE '%' || p_query || '%'
        )
      )
  ),
  marketplace_results AS (
    -- Search marketplace templates (if enabled)
    SELECT
      'agent_template'::TEXT as resource_type,
      at.id as resource_id,
      at.name,
      at.description,
      at.tags,
      LEFT(COALESCE(at.content, ''), 200) as content_preview,
      (
        -- Text search score
        ts_rank(
          to_tsvector('english', 
            COALESCE(at.name, '') || ' ' || 
            COALESCE(at.description, '') || ' ' ||
            COALESCE(at.content, '')
          ),
          plainto_tsquery('english', p_query)
        ) * 1.5 +
        -- Boost for name matches
        CASE WHEN at.name ILIKE '%' || p_query || '%' THEN 0.8 ELSE 0.0 END +
        -- Boost for popular templates
        CASE 
          WHEN at.downloads_count > 100 THEN 0.4
          WHEN at.downloads_count > 50 THEN 0.2
          ELSE 0.0
        END +
        -- Boost for highly rated templates
        CASE 
          WHEN at.average_rating >= 4.5 THEN 0.3
          WHEN at.average_rating >= 4.0 THEN 0.2
          ELSE 0.0
        END
      )::DECIMAL as relevance_score
    FROM agent_templates at
    WHERE p_include_marketplace = TRUE
      AND at.is_published = TRUE
      AND at.deleted_at IS NULL
      AND (
        to_tsvector('english', 
          COALESCE(at.name, '') || ' ' || 
          COALESCE(at.description, '') || ' ' ||
          COALESCE(at.content, '')
        ) @@ plainto_tsquery('english', p_query)
        OR at.name ILIKE '%' || p_query || '%'
        OR at.description ILIKE '%' || p_query || '%'
        OR EXISTS (
          SELECT 1 FROM unnest(at.tags) as tag
          WHERE tag ILIKE '%' || p_query || '%'
        )
      )
  ),
  combined_results AS (
    SELECT * FROM project_results
    UNION ALL
    SELECT * FROM marketplace_results
  )
  SELECT 
    cr.resource_type,
    cr.resource_id,
    cr.name,
    cr.description,
    cr.tags,
    cr.content_preview,
    cr.relevance_score
  FROM combined_results cr
  WHERE cr.relevance_score > 0
  ORDER BY cr.relevance_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION search_resources IS 'Intelligent search across project items and marketplace templates with relevance scoring for AI chat';
