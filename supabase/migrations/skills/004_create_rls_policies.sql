-- Enable Row Level Security on skills tables
-- This ensures users can only access their own data

-- ============================================
-- User Skills RLS
-- ============================================

ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

-- Users can view their own skills
CREATE POLICY "Users can view own skills"
ON user_skills FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own skills
CREATE POLICY "Users can create own skills"
ON user_skills FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own skills
CREATE POLICY "Users can update own skills"
ON user_skills FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own skills
CREATE POLICY "Users can delete own skills"
ON user_skills FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- User Skill Embeddings RLS
-- ============================================

ALTER TABLE user_skill_embeddings ENABLE ROW LEVEL SECURITY;

-- Users can view embeddings for their own skills
CREATE POLICY "Users can view own skill embeddings"
ON user_skill_embeddings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_skills
    WHERE user_skills.id = user_skill_embeddings.skill_id
    AND user_skills.user_id = auth.uid()
  )
);

-- Users can create embeddings for their own skills
CREATE POLICY "Users can create own skill embeddings"
ON user_skill_embeddings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_skills
    WHERE user_skills.id = user_skill_embeddings.skill_id
    AND user_skills.user_id = auth.uid()
  )
);

-- Users can update embeddings for their own skills
CREATE POLICY "Users can update own skill embeddings"
ON user_skill_embeddings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_skills
    WHERE user_skills.id = user_skill_embeddings.skill_id
    AND user_skills.user_id = auth.uid()
  )
);

-- Users can delete embeddings for their own skills
CREATE POLICY "Users can delete own skill embeddings"
ON user_skill_embeddings FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_skills
    WHERE user_skills.id = user_skill_embeddings.skill_id
    AND user_skills.user_id = auth.uid()
  )
);
