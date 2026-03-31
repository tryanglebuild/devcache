-- Optimize embedding storage and add batch processing support

-- Update agent_template_embeddings to use vector column
-- Migrate existing embeddings if they exist in JSONB format
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN 
    SELECT id, embedding 
    FROM agent_template_embeddings 
    WHERE embedding IS NOT NULL 
    AND embedding_vector IS NULL
  LOOP
    BEGIN
      -- Convert JSONB array to vector
      UPDATE agent_template_embeddings
      SET embedding_vector = (
        SELECT ('['|| string_agg(value::text, ',') ||']')::vector(1536)
        FROM jsonb_array_elements(rec.embedding)
      )
      WHERE id = rec.id;
    EXCEPTION WHEN OTHERS THEN
      -- Log error but continue
      RAISE NOTICE 'Failed to migrate embedding for id %: %', rec.id, SQLERRM;
    END;
  END LOOP;
END $$;

-- Create function to batch update embeddings
CREATE OR REPLACE FUNCTION batch_update_embeddings(
  p_embeddings JSONB
)
RETURNS TABLE (
  success_count INTEGER,
  error_count INTEGER
) AS $$
DECLARE
  v_success INTEGER := 0;
  v_error INTEGER := 0;
  v_item JSONB;
BEGIN
  -- p_embeddings format: [{"id": "uuid", "embedding": [0.1, 0.2, ...], "type": "template|project"}]
  
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_embeddings)
  LOOP
    BEGIN
      IF v_item->>'type' = 'template' THEN
        -- Update template embedding
        UPDATE agent_template_embeddings
        SET 
          embedding_vector = (v_item->>'embedding')::vector(1536),
          updated_at = NOW()
        WHERE template_id = (v_item->>'id')::UUID;
        
        IF NOT FOUND THEN
          -- Insert if doesn't exist
          INSERT INTO agent_template_embeddings (template_id, embedding_vector)
          VALUES ((v_item->>'id')::UUID, (v_item->>'embedding')::vector(1536));
        END IF;
        
      ELSIF v_item->>'type' = 'project' THEN
        -- Update project item embedding
        UPDATE project_items
        SET 
          embedding_vector = (v_item->>'embedding')::vector(1536),
          embedding_updated_at = NOW()
        WHERE id = (v_item->>'id')::UUID;
      END IF;
      
      v_success := v_success + 1;
      
    EXCEPTION WHEN OTHERS THEN
      v_error := v_error + 1;
      RAISE NOTICE 'Failed to update embedding for %: %', v_item->>'id', SQLERRM;
    END;
  END LOOP;
  
  RETURN QUERY SELECT v_success, v_error;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

-- Create function to get items needing embeddings
CREATE OR REPLACE FUNCTION get_items_needing_embeddings(
  p_limit INTEGER DEFAULT 10,
  p_type TEXT DEFAULT 'all' -- 'template', 'project', or 'all'
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  name TEXT,
  description TEXT,
  content TEXT,
  tags TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  (
    -- Templates needing embeddings
    SELECT 
      at.id,
      'template'::TEXT as type,
      at.name,
      at.description,
      at.content,
      at.tags
    FROM agent_templates at
    LEFT JOIN agent_template_embeddings ate ON ate.template_id = at.id
    WHERE at.is_published = TRUE
      AND at.deleted_at IS NULL
      AND (ate.embedding_vector IS NULL OR ate.updated_at < at.updated_at)
      AND (p_type = 'all' OR p_type = 'template')
    ORDER BY at.updated_at DESC
    LIMIT CASE WHEN p_type = 'all' THEN p_limit / 2 ELSE p_limit END
  )
  UNION ALL
  (
    -- Project items needing embeddings
    SELECT 
      pi.id,
      'project'::TEXT as type,
      pi.name,
      pi.description,
      pi.content,
      ARRAY(
        SELECT t.name 
        FROM tags t 
        JOIN project_item_tags pit ON pit.tag_id = t.id 
        WHERE pit.project_item_id = pi.id
      ) as tags
    FROM project_items pi
    WHERE pi.deleted_at IS NULL
      AND (pi.embedding_vector IS NULL OR pi.embedding_updated_at < pi.updated_at)
      AND (p_type = 'all' OR p_type = 'project')
    ORDER BY pi.updated_at DESC
    LIMIT CASE WHEN p_type = 'all' THEN p_limit / 2 ELSE p_limit END
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Add index for finding items needing embeddings
CREATE INDEX IF NOT EXISTS idx_agent_templates_embedding_status 
ON agent_templates(updated_at DESC) 
WHERE is_published = TRUE AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_project_items_embedding_status 
ON project_items(updated_at DESC) 
WHERE deleted_at IS NULL;

-- Add comments
COMMENT ON FUNCTION batch_update_embeddings IS 'Batch update embeddings for templates and project items';
COMMENT ON FUNCTION get_items_needing_embeddings IS 'Get items that need embeddings generated or updated';
