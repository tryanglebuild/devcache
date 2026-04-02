-- Create indexes for performance optimization

-- Index for fetching active skills by user (most common query)
CREATE INDEX IF NOT EXISTS idx_user_skills_user_active 
ON user_skills(user_id, is_active, priority DESC);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_user_skills_category 
ON user_skills(category) 
WHERE is_active = true;

-- Index for vector similarity search (HNSW for better performance)
CREATE INDEX IF NOT EXISTS idx_user_skill_embeddings_vector 
ON user_skill_embeddings 
USING hnsw (embedding_vector vector_cosine_ops);

-- Index for timestamp queries
CREATE INDEX IF NOT EXISTS idx_user_skills_updated 
ON user_skills(updated_at DESC);

-- Index for last used tracking
CREATE INDEX IF NOT EXISTS idx_user_skills_last_used 
ON user_skills(last_used_at DESC) 
WHERE last_used_at IS NOT NULL;

-- Add comments
COMMENT ON INDEX idx_user_skills_user_active IS 'Optimizes fetching active skills ordered by priority';
COMMENT ON INDEX idx_user_skill_embeddings_vector IS 'HNSW index for fast vector similarity search';
