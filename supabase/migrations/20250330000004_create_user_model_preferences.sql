-- Create user_model_preferences table
-- This table stores user preferences for AI model selection

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

-- Create index for user lookup
CREATE INDEX idx_user_model_preferences_user_id ON user_model_preferences(user_id);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_model_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER trigger_update_user_model_preferences_updated_at
  BEFORE UPDATE ON user_model_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_model_preferences_updated_at();

-- Add comment for documentation
COMMENT ON TABLE user_model_preferences IS 'Stores user preferences for AI model selection and usage statistics';
COMMENT ON COLUMN user_model_preferences.default_model IS 'Default OpenRouter model ID for new chat sessions';
COMMENT ON COLUMN user_model_preferences.favorite_models IS 'Array of favorite model IDs for quick access';
COMMENT ON COLUMN user_model_preferences.model_usage_stats IS 'JSON object tracking usage statistics per model';
