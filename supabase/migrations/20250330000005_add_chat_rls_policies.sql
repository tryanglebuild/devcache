-- Enable Row Level Security on all chat tables
-- This ensures users can only access their own data

-- ============================================
-- Chat Sessions RLS
-- ============================================

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
ON chat_sessions FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own sessions
CREATE POLICY "Users can create own sessions"
ON chat_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
ON chat_sessions FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete own sessions"
ON chat_sessions FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- Chat Messages RLS
-- ============================================

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages in their own sessions
CREATE POLICY "Users can view messages in own sessions"
ON chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_sessions
    WHERE chat_sessions.id = chat_messages.session_id
    AND chat_sessions.user_id = auth.uid()
  )
);

-- Users can create messages in their own sessions
CREATE POLICY "Users can create messages in own sessions"
ON chat_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_sessions
    WHERE chat_sessions.id = chat_messages.session_id
    AND chat_sessions.user_id = auth.uid()
  )
);

-- Users can update messages in their own sessions
CREATE POLICY "Users can update messages in own sessions"
ON chat_messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM chat_sessions
    WHERE chat_sessions.id = chat_messages.session_id
    AND chat_sessions.user_id = auth.uid()
  )
);

-- Users can delete messages in their own sessions
CREATE POLICY "Users can delete messages in own sessions"
ON chat_messages FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM chat_sessions
    WHERE chat_sessions.id = chat_messages.session_id
    AND chat_sessions.user_id = auth.uid()
  )
);

-- ============================================
-- Chat Search Results RLS
-- ============================================

ALTER TABLE chat_search_results ENABLE ROW LEVEL SECURITY;

-- Users can view search results for their own messages
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

-- Users can create search results for their own messages
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

-- ============================================
-- User Model Preferences RLS
-- ============================================

ALTER TABLE user_model_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
ON user_model_preferences FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
ON user_model_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
ON user_model_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own preferences
CREATE POLICY "Users can delete own preferences"
ON user_model_preferences FOR DELETE
USING (auth.uid() = user_id);
