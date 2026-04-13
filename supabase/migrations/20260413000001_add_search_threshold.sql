-- Add search_relevance_threshold to user_model_preferences
-- Users can configure this in Settings → Preferences (AI tab)
-- Range: 0.0 (broadest) to 1.0 (strictest). Default: 0.30
ALTER TABLE user_model_preferences
  ADD COLUMN IF NOT EXISTS search_relevance_threshold NUMERIC(3,2)
    NOT NULL DEFAULT 0.30
    CHECK (search_relevance_threshold >= 0.0 AND search_relevance_threshold <= 1.0);

COMMENT ON COLUMN user_model_preferences.search_relevance_threshold IS
  'Minimum relevance score for search results in AI chat (0.0=broadest, 1.0=strictest). Default 0.30.';

-- Drop old signature and recreate with p_min_relevance parameter
DROP FUNCTION IF EXISTS search_resources_hybrid(uuid, text, vector, boolean, integer);

CREATE OR REPLACE FUNCTION search_resources_hybrid(
  p_user_id UUID,
  p_query_text TEXT,
  p_query_embedding vector(1536),
  p_include_marketplace BOOLEAN DEFAULT TRUE,
  p_limit INTEGER DEFAULT 10,
  p_min_relevance NUMERIC DEFAULT 0.3
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
DECLARE
  v_project_limit INTEGER;
  v_marketplace_limit INTEGER;
  v_marketplace_min NUMERIC;
BEGIN
  v_marketplace_limit := GREATEST(3, p_limit / 2);
  v_project_limit := p_limit - v_marketplace_limit;
  v_marketplace_min := GREATEST(0.1, p_min_relevance * 0.5);

  RETURN QUERY
  WITH project_scored AS (
    SELECT
      CASE 
        WHEN pi.type = 'folder' THEN 'project_folder'::TEXT
        ELSE 'project_item'::TEXT
      END as res_type,
      pi.id as res_id,
      pi.name as res_name,
      CASE
        WHEN pi.type = 'folder' THEN
          COALESCE(pi.description, 'Folder with ' || (SELECT COUNT(*)::TEXT FROM project_items c WHERE c.parent_id = pi.id) || ' items')
        ELSE pi.description
      END as res_description,
      pi.language_tags as res_tags,
      CASE
        WHEN pi.type = 'folder' THEN
          'Folder containing: ' || COALESCE((SELECT STRING_AGG(c.name, ', ') FROM (SELECT children.name FROM project_items children WHERE children.parent_id = pi.id LIMIT 5) c), 'empty folder')
        ELSE LEFT(COALESCE(pi.content, ''), 200)
      END as res_content_preview,
      CASE WHEN pi.embedding_vector IS NOT NULL THEN (1 - (pi.embedding_vector <=> p_query_embedding))::DECIMAL ELSE 0.0 END as sim_score,
      (
        CASE WHEN pi.embedding_vector IS NOT NULL THEN (1 - (pi.embedding_vector <=> p_query_embedding)) * 5.0 ELSE 0.0 END +
        CASE 
          WHEN EXISTS (SELECT 1 FROM unnest(pi.language_tags) tag WHERE LOWER(tag) = LOWER(p_query_text)) THEN 3.0
          WHEN EXISTS (SELECT 1 FROM unnest(pi.language_tags) tag WHERE LOWER(tag) LIKE '%' || LOWER(p_query_text) || '%') THEN 2.0
          ELSE 0.0
        END +
        CASE WHEN LOWER(pi.name) LIKE '%' || LOWER(p_query_text) || '%' THEN 2.0 ELSE 0.0 END +
        ts_rank(to_tsvector('english', COALESCE(pi.name,'') || ' ' || COALESCE(pi.description,'') || ' ' || COALESCE(pi.content,'')), plainto_tsquery('english', p_query_text)) * 1.0 +
        CASE WHEN pi.updated_at > NOW() - INTERVAL '7 days' THEN 0.2 WHEN pi.updated_at > NOW() - INTERVAL '30 days' THEN 0.1 ELSE 0.0 END +
        CASE WHEN pi.is_favorite THEN 0.1 ELSE 0.0 END +
        CASE WHEN pi.type = 'folder' THEN 0.1 ELSE 0.0 END +
        CASE WHEN pi.name IN ('README.md','features.md','TODO.md','NOTES.md','notes.md','todo.md') THEN -0.5 WHEN pi.name ILIKE 'untitled%' THEN -0.3 ELSE 0.0 END
      )::DECIMAL as rel_score
    FROM project_items pi
    WHERE pi.user_id = p_user_id
      AND (pi.type = 'folder' OR (pi.type = 'file' AND pi.content IS NOT NULL AND LENGTH(TRIM(pi.content)) > 0))
      AND (
        pi.embedding_vector IS NOT NULL
        OR to_tsvector('english', COALESCE(pi.name,'') || ' ' || COALESCE(pi.description,'') || ' ' || COALESCE(pi.content,'')) @@ plainto_tsquery('english', p_query_text)
        OR pi.name ILIKE '%' || p_query_text || '%'
        OR pi.description ILIKE '%' || p_query_text || '%'
        OR EXISTS (SELECT 1 FROM unnest(pi.language_tags) tag WHERE LOWER(tag) LIKE '%' || LOWER(p_query_text) || '%')
      )
  ),
  project_results AS (
    SELECT * FROM project_scored WHERE rel_score > p_min_relevance ORDER BY rel_score DESC LIMIT v_project_limit
  ),
  marketplace_scored AS (
    SELECT
      'marketplace_template'::TEXT as res_type,
      at.id as res_id,
      at.name as res_name,
      at.description as res_description,
      at.tags as res_tags,
      LEFT(COALESCE(at.content, ''), 200) as res_content_preview,
      CASE WHEN ate.embedding_vector IS NOT NULL THEN (1 - (ate.embedding_vector <=> p_query_embedding))::DECIMAL ELSE 0.0 END as sim_score,
      (
        CASE WHEN ate.embedding_vector IS NOT NULL THEN (1 - (ate.embedding_vector <=> p_query_embedding)) * 4.0 ELSE 0.0 END +
        CASE 
          WHEN EXISTS (SELECT 1 FROM unnest(at.tags) tag WHERE LOWER(tag) = LOWER(p_query_text)) THEN 2.5
          WHEN EXISTS (SELECT 1 FROM unnest(at.tags) tag WHERE LOWER(tag) LIKE '%' || LOWER(p_query_text) || '%') THEN 1.5
          ELSE 0.0
        END +
        CASE WHEN LOWER(at.name) LIKE '%' || LOWER(p_query_text) || '%' THEN 1.5 ELSE 0.0 END +
        ts_rank(to_tsvector('english', COALESCE(at.name,'') || ' ' || COALESCE(at.description,'') || ' ' || COALESCE(at.content,'')), plainto_tsquery('english', p_query_text)) * 0.8 +
        CASE WHEN at.download_count > 100 THEN 0.3 WHEN at.download_count > 50 THEN 0.15 ELSE 0.0 END +
        CASE WHEN at.rating_average >= 4.5 THEN 0.2 WHEN at.rating_average >= 4.0 THEN 0.1 ELSE 0.0 END
      )::DECIMAL as rel_score
    FROM agent_templates at
    LEFT JOIN agent_template_embeddings ate ON ate.agent_id = at.id
    WHERE at.visibility = 'public'
      AND at.content IS NOT NULL
      AND LENGTH(TRIM(at.content)) > 0
      AND p_include_marketplace = TRUE
      AND (
        ate.embedding_vector IS NOT NULL
        OR to_tsvector('english', COALESCE(at.name,'') || ' ' || COALESCE(at.description,'') || ' ' || COALESCE(at.content,'')) @@ plainto_tsquery('english', p_query_text)
        OR at.name ILIKE '%' || p_query_text || '%'
        OR at.description ILIKE '%' || p_query_text || '%'
        OR EXISTS (SELECT 1 FROM unnest(at.tags) tag WHERE LOWER(tag) LIKE '%' || LOWER(p_query_text) || '%')
      )
  ),
  marketplace_results AS (
    SELECT * FROM marketplace_scored WHERE rel_score > v_marketplace_min ORDER BY rel_score DESC LIMIT v_marketplace_limit
  )
  SELECT combined.res_type, combined.res_id, combined.res_name, combined.res_description,
         combined.res_tags, combined.res_content_preview, combined.rel_score, combined.sim_score
  FROM (SELECT * FROM project_results UNION ALL SELECT * FROM marketplace_results) combined
  ORDER BY combined.rel_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_resources_hybrid IS
  'Hybrid search with two-bucket approach and configurable p_min_relevance. Marketplace threshold is capped at max(0.1, p_min_relevance*0.5) to guarantee agents always appear.';
