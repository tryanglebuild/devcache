-- Filter Empty Content from Search Results
-- This migration updates the search function to exclude files/folders without content

CREATE OR REPLACE FUNCTION search_resources_hybrid(
  p_user_id UUID,
  p_query_text TEXT,
  p_query_embedding vector(1536),
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
  relevance_score DECIMAL,
  similarity_score DECIMAL
) AS $
BEGIN
  RETURN QUERY
  WITH project_results AS (
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
      -- Semantic similarity (cosine distance, lower is better, so we use 1 - distance)
      CASE 
        WHEN pi.embedding_vector IS NOT NULL THEN
          (1 - (pi.embedding_vector <=> p_query_embedding))::DECIMAL
        ELSE 0.0
      END as similarity_score,
      -- Combined relevance score
      (
        -- Vector similarity (weighted heavily at 3.0)
        CASE 
          WHEN pi.embedding_vector IS NOT NULL THEN
            (1 - (pi.embedding_vector <=> p_query_embedding)) * 3.0
          ELSE 0.0
        END +
        -- Text search score (weighted at 1.5)
        ts_rank(
          to_tsvector('english', 
            COALESCE(pi.name, '') || ' ' || 
            COALESCE(pi.description, '') || ' ' ||
            COALESCE(pi.content, '')
          ),
          plainto_tsquery('english', p_query_text)
        ) * 1.5 +
        -- Name exact match boost
        CASE WHEN pi.name ILIKE '%' || p_query_text || '%' THEN 1.0 ELSE 0.0 END +
        -- Recency boost
        CASE 
          WHEN pi.updated_at > NOW() - INTERVAL '7 days' THEN 0.5
          WHEN pi.updated_at > NOW() - INTERVAL '30 days' THEN 0.3
          ELSE 0.0
        END +
        -- Favorited boost
        CASE WHEN pi.is_favorited THEN 0.3 ELSE 0.0 END
      )::DECIMAL as relevance_score
    FROM project_items pi
    WHERE pi.user_id = p_user_id
      AND pi.deleted_at IS NULL
      -- FILTER: Exclude empty content (folders or files without content)
      AND pi.type = 'file'
      AND pi.content IS NOT NULL
      AND LENGTH(TRIM(pi.content)) > 0
      AND (
        -- Has embedding for semantic search
        pi.embedding_vector IS NOT NULL
        OR
        -- Or matches text search
        to_tsvector('english', 
          COALESCE(pi.name, '') || ' ' || 
          COALESCE(pi.description, '') || ' ' ||
          COALESCE(pi.content, '')
        ) @@ plainto_tsquery('english', p_query_text)
        OR pi.name ILIKE '%' || p_query_text || '%'
        OR pi.description ILIKE '%' || p_query_text || '%'
      )
  ),
  marketplace_results AS (
    SELECT
      'agent_template'::TEXT as resource_type,
      at.id as resource_id,
      at.name,
      at.description,
      at.tags,
      LEFT(COALESCE(at.content, ''), 200) as content_preview,
      -- Semantic similarity
      CASE 
        WHEN ate.embedding_vector IS NOT NULL THEN
          (1 - (ate.embedding_vector <=> p_query_embedding))::DECIMAL
        ELSE 0.0
      END as similarity_score,
      -- Combined relevance score
      (
        -- Vector similarity (weighted at 2.5 for marketplace)
        CASE 
          WHEN ate.embedding_vector IS NOT NULL THEN
            (1 - (ate.embedding_vector <=> p_query_embedding)) * 2.5
          ELSE 0.0
        END +
        -- Text search score
        ts_rank(
          to_tsvector('english', 
            COALESCE(at.name, '') || ' ' || 
            COALESCE(at.description, '') || ' ' ||
            COALESCE(at.content, '')
          ),
          plainto_tsquery('english', p_query_text)
        ) * 1.2 +
        -- Name match boost
        CASE WHEN at.name ILIKE '%' || p_query_text || '%' THEN 0.8 ELSE 0.0 END +
        -- Popularity boost
        CASE 
          WHEN at.download_count > 100 THEN 0.4
          WHEN at.download_count > 50 THEN 0.2
          ELSE 0.0
        END +
        -- Rating boost
        CASE 
          WHEN at.average_rating >= 4.5 THEN 0.3
          WHEN at.average_rating >= 4.0 THEN 0.2
          ELSE 0.0
        END
      )::DECIMAL as relevance_score
    FROM agent_templates at
    LEFT JOIN agent_template_embeddings ate ON ate.template_id = at.id
    WHERE at.is_published = TRUE
      AND at.deleted_at IS NULL
      -- FILTER: Exclude templates without content
      AND at.content IS NOT NULL
      AND LENGTH(TRIM(at.content)) > 0
      AND p_include_marketplace = TRUE
      AND (
        -- Has embedding for semantic search
        ate.embedding_vector IS NOT NULL
        OR
        -- Or matches text search
        to_tsvector('english', 
          COALESCE(at.name, '') || ' ' || 
          COALESCE(at.description, '') || ' ' ||
          COALESCE(at.content, '')
        ) @@ plainto_tsquery('english', p_query_text)
        OR at.name ILIKE '%' || p_query_text || '%'
        OR at.description ILIKE '%' || p_query_text || '%'
      )
  )
  SELECT * FROM (
    SELECT * FROM project_results
    UNION ALL
    SELECT * FROM marketplace_results
  ) combined
  ORDER BY relevance_score DESC
  LIMIT p_limit;
END;
$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_resources_hybrid IS 'Hybrid search combining vector similarity and text search for chat recommendations. Filters out empty content.';
