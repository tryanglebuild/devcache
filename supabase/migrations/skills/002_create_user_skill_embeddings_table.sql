-- Create user_skill_embeddings table
-- Stores vector embeddings for semantic search of user skills

CREATE TABLE IF NOT EXISTS user_skill_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL REFERENCES user_skills(id) ON DELETE CASCADE UNIQUE,
  embedding_vector vector(1536),
  content_hash TEXT NOT NULL,
  indexed_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_skill_embedding UNIQUE(skill_id)
);

-- Add comments for documentation
COMMENT ON TABLE user_skill_embeddings IS 'Vector embeddings for semantic search of user skills';
COMMENT ON COLUMN user_skill_embeddings.embedding_vector IS 'OpenAI text-embedding-ada-002 vector (1536 dimensions)';
COMMENT ON COLUMN user_skill_embeddings.content_hash IS 'MD5 hash of skill content for change detection';
COMMENT ON COLUMN user_skill_embeddings.indexed_at IS 'Timestamp when embedding was last generated';
