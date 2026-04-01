-- Include Folders in Search Results
-- This migration updates the search function to include folders with their child file count

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
) AS $$
BEGIN
  RETURN QUERY
  WITH project_results AS (
    SELECT
      CASE 
        WHEN pi.type = 'folder' THEN 'project_folder'::TEXT
        ELSE 'project_item'::TEXT
      END as resource_type,
      pi.id as resource_id,
      pi.name as name,
      CASE
        WHEN pi.type = 'folder' THEN
          COALESCE(
            pi.description,
            'Folder with ' || (
              SELECT COUNT(*)::TEXT 
              FROM project_items children 
              WHERE children.parent_id = pi.id
            ) || ' items'
          )
        ELSE pi.description
      END as description,
      pi.language_tags as tags,
      CASE
        WHEN pi.type = 'folder' THEN
          'Folder containing: ' || COALESCE((
            SELECT STRING_AGG(child_name, ', ')
            FROM (
              SELECT children.name as child_name
              FROM project_items children 
              WHERE children.parent_id = pi.id
              LIMIT 5
            ) child_items
          ), 'empty folder')
        ELSE LEFT(COALESCE(pi.content, ''), 200)
      END as content_preview,
      CASE 
        WHEN pi.embedding_vector IS NOT NULL THEN
          (1 - (pi.embedding_vector <=> p_query_embedding))::DECIMAL
        ELSE 0.0
      END as similarity_score,
      (
        CASE 
          WHEN pi.embedding_vector IS NOT NULL THEN
            (1 - (pi.embedding_vector <=> p_query_embedding)) * 3.0
          ELSE 0.0
        END +
        ts_rank(
          to_tsvector('english', 
            COALESCE(pi.name, '') || ' ' || 
            COALESCE(pi.description, '') || ' ' ||
            COALESCE(pi.content, '')
          ),
          plainto_tsquery('english', p_query_text)
        ) * 1.5 +
        CASE WHEN pi.name ILIKE '%' || p_query_text || '%' THEN 1.0 ELSE 0.0 END +
        CASE 
          WHEN pi.updated_at > NOW() - INTERVAL '7 days' THEN 0.5
          WHEN pi.updated_at > NOW() - INTERVAL '30 days' THEN 0.3
          ELSE 0.0
        END +
        CASE WHEN pi.is_favorite THEN 0.3 ELSE 0.0 END +
        CASE WHEN pi.type = 'folder' THEN 0.2 ELSE 0.0 END
      )::DECIMAL as relevance_score
    FROM project_items pi
    WHERE pi.user_id = p_user_id
      AND (
        pi.type = 'folder'
        OR (
          pi.type = 'file'
          AND pi.content IS NOT NULL
          AND LENGTH(TRIM(pi.content)) > 0
        )
      )
      AND (
        pi.embedding_vector IS NOT NULL
        OR
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
      at.name as name,
      at.description as description,
      at.tags as tags,
      LEFT(COALESCE(at.content, ''), 200) as content_preview,
      CASE 
        WHEN ate.embedding_vector IS NOT NULL THEN
          (1 - (ate.embedding_vector <=> p_query_embedding))::DECIMAL
        ELSE 0.0
      END as similarity_score,
      (
        CASE 
          WHEN ate.embedding_vector IS NOT NULL THEN
            (1 - (ate.embedding_vector <=> p_query_embedding)) * 2.5
          ELSE 0.0
        END +
        ts_rank(
          to_tsvector('english', 
            COALESCE(at.name, '') || ' ' || 
            COALESCE(at.description, '') || ' ' ||
            COALESCE(at.content, '')
          ),
          plainto_tsquery('english', p_query_text)
        ) * 1.2 +
        CASE WHEN at.name ILIKE '%' || p_query_text || '%' THEN 0.8 ELSE 0.0 END +
        CASE 
          WHEN at.download_count > 100 THEN 0.4
          WHEN at.download_count > 50 THEN 0.2
          ELSE 0.0
        END +
        CASE 
          WHEN at.rating_average >= 4.5 THEN 0.3
          WHEN at.rating_average >= 4.0 THEN 0.2
          ELSE 0.0
        END
      )::DECIMAL as relevance_score
    FROM agent_templates at
    LEFT JOIN agent_template_embeddings ate ON ate.agent_id = at.id
    WHERE at.visibility = 'public'
      AND at.content IS NOT NULL
      AND LENGTH(TRIM(at.content)) > 0
      AND p_include_marketplace = TRUE
      AND (
        ate.embedding_vector IS NOT NULL
        OR
        to_tsvector('english', 
          COALESCE(at.name, '') || ' ' || 
          COALESCE(at.description, '') || ' ' ||
          COALESCE(at.content, '')
        ) @@ plainto_tsquery('english', p_query_text)
        OR at.name ILIKE '%' || p_query_text || '%'
        OR at.description ILIKE '%' || p_query_text || '%'
      )
  )
  SELECT 
    combined.resource_type,
    combined.resource_id,
    combined.name,
    combined.description,
    combined.tags,
    combined.content_preview,
    combined.relevance_score,
    combined.similarity_score
  FROM (
    SELECT * FROM project_results
    UNION ALL
    SELECT * FROM marketplace_results
  ) combined
  ORDER BY combined.relevance_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_resources_hybrid IS 'Hybrid search combining vector similarity and text search for chat recommendations. Now includes folders with child file information.';