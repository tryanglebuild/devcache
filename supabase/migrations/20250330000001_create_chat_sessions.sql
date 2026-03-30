-- Create chat_sessions table
-- This table stores conversation sessions with metadata and model selection

CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  context_type TEXT DEFAULT 'general' CHECK (context_type IN ('general', 'project', 'marketplace')),
  selected_model TEXT DEFAULT 'anthropic/claude-3-haiku',
  related_resource_ids UUID[] DEFAULT ARRAY[]::UUID[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_last_activity ON chat_sessions(user_id, last_activity_at DESC);
CREATE INDEX idx_chat_sessions_model ON chat_sessions(selected_model);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER trigger_update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_sessions_updated_at();

-- Add comment for documentation
COMMENT ON TABLE chat_sessions IS 'Stores AI chat conversation sessions with user preferences and model selection';
COMMENT ON COLUMN chat_sessions.context_type IS 'Type of chat context: general, project-specific, or marketplace-focused';
COMMENT ON COLUMN chat_sessions.selected_model IS 'OpenRouter model ID selected for this session';
COMMENT ON COLUMN chat_sessions.related_resource_ids IS 'Array of project_items or agent_templates IDs related to this conversation';
