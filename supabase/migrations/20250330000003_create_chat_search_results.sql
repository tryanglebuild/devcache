-- Create chat_search_results table
-- This table links messages to discovered resources (polymorphic relationship)

CREATE TABLE IF NOT EXISTS chat_search_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('project_item', 'agent_template', 'file_attachment')),
  resource_id UUID NOT NULL,
  relevance_score DECIMAL(3,2) CHECK (relevance_score >= 0 AND relevance_score <= 1),
  matched_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_search_results_message_id ON chat_search_results(message_id);
CREATE INDEX idx_search_results_resource ON chat_search_results(resource_type, resource_id);
CREATE INDEX idx_search_results_relevance ON chat_search_results(relevance_score DESC);

-- Add comment for documentation
COMMENT ON TABLE chat_search_results IS 'Links chat messages to discovered resources with relevance scoring';
COMMENT ON COLUMN chat_search_results.resource_type IS 'Type of resource: project_item, agent_template, or file_attachment';
COMMENT ON COLUMN chat_search_results.resource_id IS 'UUID of the resource in its respective table';
COMMENT ON COLUMN chat_search_results.relevance_score IS 'Relevance score from 0.00 to 1.00';
COMMENT ON COLUMN chat_search_results.matched_fields IS 'JSON object showing which fields matched the search query';
