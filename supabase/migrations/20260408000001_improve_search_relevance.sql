-- Improve Search Relevance with Tag Matching and Better Weights
-- This migration improves the search algorithm to prioritize semantic relevance and tag matching

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
        -- Semantic similarity (INCREASED WEIGHT)
        CASE 
          WHEN pi.embedding_vector IS NOT NULL THEN
            (1 - (pi.embedding_vector <=> p_query_embedding)) * 5.0
          ELSE 0.0
        END +
        
        -- Tag matching (NEW - HIGH PRIORITY)
        CASE 
          -- Exact tag match (case-insensitive)
          WHEN EXISTS (
            SELECT 1 FROM unnest(pi.language_tags) tag 
            WHERE LOWER(tag) = LOWER(p_query_text)
          ) THEN 3.0
          -- Partial tag match
          WHEN EXISTS (
            SELECT 1 FROM unnest(pi.language_tags) tag 
            WHERE LOWER(tag) LIKE '%' || LOWER(p_query_text) || '%'
          ) THEN 2.0
          ELSE 0.0
        END +
        
        -- Exact name match (INCREASED WEIGHT)
        CASE WHEN LOWER(pi.name) LIKE '%' || LOWER(p_query_text) || '%' THEN 2.0 ELSE 0.0 END +
        
        -- Full-text search (REDUCED WEIGHT)
        ts_rank(
          to_tsvector('english', 
            COALESCE(pi.name, '') || ' ' || 
            COALESCE(pi.description, '') || ' ' ||
            COALESCE(pi.content, '')
          ),
          plainto_tsquery('english', p_query_text)
        ) * 1.0 +
        
        -- Recency boost (REDUCED)
        CASE 
          WHEN pi.updated_at > NOW() - INTERVAL '7 days' THEN 0.2
          WHEN pi.updated_at > NOW() - INTERVAL '30 days' THEN 0.1
          ELSE 0.0
        END +
        
        -- Favorite boost (REDUCED)
        CASE WHEN pi.is_favorite THEN 0.1 ELSE 0.0 END +
        
        -- Folder boost (REDUCED)
        CASE WHEN pi.type = 'folder' THEN 0.1 ELSE 0.0 END +
        
        -- Penalty for generic filenames (NEW)
        CASE 
          WHEN pi.name IN ('README.md', 'features.md', 'TODO.md', 'NOTES.md', 'notes.md', 'todo.md') THEN -0.5
          WHEN pi.name ILIKE 'untitled%' THEN -0.3
          ELSE 0.0
        END
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
        -- Has embedding (semantic search)
        pi.embedding_vector IS NOT NULL
        OR
        -- Or has text match
        to_tsvector('english', 
          COALESCE(pi.name, '') || ' ' || 
          COALESCE(pi.description, '') || ' ' ||
          COALESCE(pi.content, '')
        ) @@ plainto_tsquery('english', p_query_text)
        OR
        -- Or name match
        pi.name ILIKE '%' || p_query_text || '%'
        OR
        -- Or description match
        pi.description ILIKE '%' || p_query_text || '%'
        OR
        -- Or tag match (NEW)
        EXISTS (
          SELECT 1 FROM unnest(pi.language_tags) tag 
          WHERE LOWER(tag) LIKE '%' || LOWER(p_query_text) || '%'
        )
      )
  ),
  marketplace_results AS (
    SELECT
      'marketplace_template'::TEXT as resource_type,
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
        -- Semantic similarity (INCREASED WEIGHT)
        CASE 
          WHEN ate.embedding_vector IS NOT NULL THEN
            (1 - (ate.embedding_vector <=> p_query_embedding)) * 4.0
          ELSE 0.0
        END +
        
        -- Tag matching (NEW - HIGH PRIORITY)
        CASE 
          -- Exact tag match
          WHEN EXISTS (
            SELECT 1 FROM unnest(at.tags) tag 
            WHERE LOWER(tag) = LOWER(p_query_text)
          ) THEN 2.5
          -- Partial tag match
          WHEN EXISTS (
            SELECT 1 FROM unnest(at.tags) tag 
            WHERE LOWER(tag) LIKE '%' || LOWER(p_query_text) || '%'
          ) THEN 1.5
          ELSE 0.0
        END +
        
        -- Exact name match (INCREASED WEIGHT)
        CASE WHEN LOWER(at.name) LIKE '%' || LOWER(p_query_text) || '%' THEN 1.5 ELSE 0.0 END +
        
        -- Full-text search (REDUCED WEIGHT)
        ts_rank(
          to_tsvector('english', 
            COALESCE(at.name, '') || ' ' || 
            COALESCE(at.description, '') || ' ' ||
            COALESCE(at.content, '')
          ),
          plainto_tsquery('english', p_query_text)
        ) * 0.8 +
        
        -- Popularity boost (REDUCED)
        CASE 
          WHEN at.download_count > 100 THEN 0.3
          WHEN at.download_count > 50 THEN 0.15
          ELSE 0.0
        END +
        
        -- Rating boost (REDUCED)
        CASE 
          WHEN at.rating_average >= 4.5 THEN 0.2
          WHEN at.rating_average >= 4.0 THEN 0.1
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
        -- Has embedding
        ate.embedding_vector IS NOT NULL
        OR
        -- Or has text match
        to_tsvector('english', 
          COALESCE(at.name, '') || ' ' || 
          COALESCE(at.description, '') || ' ' ||
          COALESCE(at.content, '')
        ) @@ plainto_tsquery('english', p_query_text)
        OR
        -- Or name match
        at.name ILIKE '%' || p_query_text || '%'
        OR
        -- Or description match
        at.description ILIKE '%' || p_query_text || '%'
        OR
        -- Or tag match (NEW)
        EXISTS (
          SELECT 1 FROM unnest(at.tags) tag 
          WHERE LOWER(tag) LIKE '%' || LOWER(p_query_text) || '%'
        )
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
  WHERE combined.relevance_score > 0.5  -- NEW: Minimum relevance threshold
  ORDER BY combined.relevance_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_resources_hybrid IS 'Hybrid search with improved relevance: prioritizes semantic similarity, tag matching, and penalizes generic filenames. Includes minimum relevance threshold.';
