-- Create chat_messages table
-- This table stores individual messages in conversations with model tracking

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  model_used TEXT,
  tokens_input INTEGER,
  tokens_output INTEGER,
  cost_usd DECIMAL(10,6),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id, created_at);
CREATE INDEX idx_chat_messages_model ON chat_messages(model_used);
CREATE INDEX idx_chat_messages_role ON chat_messages(role);

-- Add comment for documentation
COMMENT ON TABLE chat_messages IS 'Stores individual messages in AI chat conversations with usage tracking';
COMMENT ON COLUMN chat_messages.role IS 'Message role: user (human), assistant (AI), or system (automated)';
COMMENT ON COLUMN chat_messages.model_used IS 'OpenRouter model ID that generated this message (for assistant role)';
COMMENT ON COLUMN chat_messages.tokens_input IS 'Number of input tokens used for this message';
COMMENT ON COLUMN chat_messages.tokens_output IS 'Number of output tokens generated for this message';
COMMENT ON COLUMN chat_messages.cost_usd IS 'Estimated cost in USD for this message';
