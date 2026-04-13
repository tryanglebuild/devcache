-- Add user-configurable search relevance threshold to preferences
-- Range: 0.0 (broadest) → 1.0 (strictest). Default 0.30.
ALTER TABLE user_model_preferences
  ADD COLUMN IF NOT EXISTS search_relevance_threshold NUMERIC(3,2)
    NOT NULL DEFAULT 0.30
    CHECK (search_relevance_threshold >= 0.0 AND search_relevance_threshold <= 1.0);

COMMENT ON COLUMN user_model_preferences.search_relevance_threshold IS
  'Minimum relevance score for search results shown in AI chat (0.0 = broadest, 1.0 = strictest). Default 0.30.';
