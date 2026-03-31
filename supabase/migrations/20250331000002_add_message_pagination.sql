-- Add pagination support for chat messages
-- This improves performance by loading messages in chunks

-- Create function to get paginated messages
CREATE OR REPLACE FUNCTION get_chat_messages_paginated(
  p_session_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_before_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  session_id UUID,
  role TEXT,
  content TEXT,
  model_used TEXT,
  tokens_input INTEGER,
  tokens_output INTEGER,
  cost_usd DECIMAL,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  has_more BOOLEAN
) AS $$
DECLARE
  v_total_count INTEGER;
  v_returned_count INTEGER;
BEGIN
  -- Get total count
  SELECT COUNT(*) INTO v_total_count
  FROM chat_messages cm
  WHERE cm.session_id = p_session_id
    AND (p_before_id IS NULL OR cm.created_at < (
      SELECT created_at FROM chat_messages WHERE id = p_before_id
    ));

  -- Return paginated results
  RETURN QUERY
  WITH paginated AS (
    SELECT 
      cm.id,
      cm.session_id,
      cm.role,
      cm.content,
      cm.model_used,
      cm.tokens_input,
      cm.tokens_output,
      cm.cost_usd,
      cm.metadata,
      cm.created_at
    FROM chat_messages cm
    WHERE cm.session_id = p_session_id
      AND (p_before_id IS NULL OR cm.created_at < (
        SELECT created_at FROM chat_messages WHERE id = p_before_id
      ))
    ORDER BY cm.created_at DESC
    LIMIT p_limit
  )
  SELECT 
    p.*,
    (v_total_count > p_limit)::BOOLEAN as has_more
  FROM paginated p
  ORDER BY p.created_at ASC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Add index for pagination queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_pagination 
ON chat_messages(session_id, created_at DESC, id);

-- Create function to get recent messages for AI context (optimized)
CREATE OR REPLACE FUNCTION get_recent_chat_context(
  p_session_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  role TEXT,
  content TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.role,
    cm.content,
    cm.created_at
  FROM chat_messages cm
  WHERE cm.session_id = p_session_id
  ORDER BY cm.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Add comments
COMMENT ON FUNCTION get_chat_messages_paginated IS 'Get paginated chat messages with cursor-based pagination';
COMMENT ON FUNCTION get_recent_chat_context IS 'Get recent messages for AI context (optimized for edge function)';
