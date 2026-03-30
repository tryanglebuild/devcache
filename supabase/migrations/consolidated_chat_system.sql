-- ============================================
-- AI Chat System - Complete Database Setup
-- Phase 1: Database Foundation
-- ============================================

-- Migration 1: Create chat_sessions table
-- ============================================

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

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_activity ON chat_sessions(user_id, last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_model ON chat_sessions(selected_model);

CREATE OR REPLACE FUNCTION update_chat_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER trigger_update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_sessions_updated_at();

COMMENT ON TABLE chat_sessions IS 'Stores AI chat conversation sessions with user preferences and model selection';

-- Migration 2: Create chat_messages table
-- ============================================

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

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_model ON chat_messages(model_used);
CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON chat_messages(role);

COMMENT ON TABLE chat_messages IS 'Stores individual messages in AI chat conversations with usage tracking';

-- Migration 3: Create chat_search_results table
-- ============================================

CREATE TABLE IF NOT EXISTS chat_search_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('project_item', 'agent_template', 'file_attachment')),
  resource_id UUID NOT NULL,
  relevance_score DECIMAL(3,2) CHECK (relevance_score >= 0 AND relevance_score <= 1),
  matched_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_results_message_id ON chat_search_results(message_id);
CREATE INDEX IF NOT EXISTS idx_search_results_resource ON chat_search_results(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_search_results_relevance ON chat_search_results(relevance_score DESC);

COMMENT ON TABLE chat_search_results IS 'Links chat messages to discovered resources with relevance scoring';

-- Migration 4: Create user_model_preferences table
-- ============================================

CREATE TABLE IF NOT EXISTS user_model_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  default_model TEXT NOT NULL DEFAULT 'anthropic/claude-3-haiku',
  favorite_models TEXT[] DEFAULT ARRAY[]::TEXT[],
  model_usage_stats JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_model_preferences_user_id ON user_model_preferences(user_id);

CREATE OR REPLACE FUNCTION update_user_model_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_model_preferences_updated_at ON user_model_preferences;
CREATE TRIGGER trigger_update_user_model_preferences_updated_at
  BEFORE UPDATE ON user_model_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_model_preferences_updated_at();

COMMENT ON TABLE user_model_preferences IS 'Stores user preferences for AI model selection and usage statistics';

-- Migration 5: Row Level Security Policies
-- ============================================

-- Chat Sessions RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own sessions" ON chat_sessions;
CREATE POLICY "Users can view own sessions"
ON chat_sessions FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own sessions" ON chat_sessions;
CREATE POLICY "Users can create own sessions"
ON chat_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON chat_sessions;
CREATE POLICY "Users can update own sessions"
ON chat_sessions FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sessions" ON chat_sessions;
CREATE POLICY "Users can delete own sessions"
ON chat_sessions FOR DELETE
USING (auth.uid() = user_id);

-- Chat Messages RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in own sessions" ON chat_messages;
CREATE POLICY "Users can view messages in own sessions"
ON chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_sessions
    WHERE chat_sessions.id = chat_messages.session_id
    AND chat_sessions.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create messages in own sessions" ON chat_messages;
CREATE POLICY "Users can create messages in own sessions"
ON chat_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_sessions
    WHERE chat_sessions.id = chat_messages.session_id
    AND chat_sessions.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update messages in own sessions" ON chat_messages;
CREATE POLICY "Users can update messages in own sessions"
ON chat_messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM chat_sessions
    WHERE chat_sessions.id = chat_messages.session_id
    AND chat_sessions.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete messages in own sessions" ON chat_messages;
CREATE POLICY "Users can delete messages in own sessions"
ON chat_messages FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM chat_sessions
    WHERE chat_sessions.id = chat_messages.session_id
    AND chat_sessions.user_id = auth.uid()
  )
);

-- Chat Search Results RLS
ALTER TABLE chat_search_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view search results for own messages" ON chat_search_results;
CREATE POLICY "Users can view search results for own messages"
ON chat_search_results FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_messages
    JOIN chat_sessions ON chat_sessions.id = chat_messages.session_id
    WHERE chat_messages.id = chat_search_results.message_id
    AND chat_sessions.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create search results for own messages" ON chat_search_results;
CREATE POLICY "Users can create search results for own messages"
ON chat_search_results FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_messages
    JOIN chat_sessions ON chat_sessions.id = chat_messages.session_id
    WHERE chat_messages.id = chat_search_results.message_id
    AND chat_sessions.user_id = auth.uid()
  )
);

-- User Model Preferences RLS
ALTER TABLE user_model_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own preferences" ON user_model_preferences;
CREATE POLICY "Users can view own preferences"
ON user_model_preferences FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON user_model_preferences;
CREATE POLICY "Users can insert own preferences"
ON user_model_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON user_model_preferences;
CREATE POLICY "Users can update own preferences"
ON user_model_preferences FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own preferences" ON user_model_preferences;
CREATE POLICY "Users can delete own preferences"
ON user_model_preferences FOR DELETE
USING (auth.uid() = user_id);
