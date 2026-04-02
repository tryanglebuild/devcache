-- Create user_skills table
-- Stores metadata for user-defined skills/steering instructions

CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'coding', 'writing', 'analysis', 'custom')),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  
  CONSTRAINT unique_user_skill_name UNIQUE(user_id, name)
);

-- Add comments for documentation
COMMENT ON TABLE user_skills IS 'Stores user-defined skills/steering instructions for AI chat customization';
COMMENT ON COLUMN user_skills.name IS 'Unique skill name per user';
COMMENT ON COLUMN user_skills.file_path IS 'Path to .md file in Supabase Storage';
COMMENT ON COLUMN user_skills.is_active IS 'Whether skill is currently active and applied in chat';
COMMENT ON COLUMN user_skills.priority IS 'Application order (0-100, higher = more priority)';
COMMENT ON COLUMN user_skills.category IS 'Skill category for organization';
COMMENT ON COLUMN user_skills.last_used_at IS 'Last time skill was applied in a chat session';
