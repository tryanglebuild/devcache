// Template Search with RAG
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from './embeddings'
import type { SearchResult } from '@/types/rag'

/**
 * Search templates using RAG with intelligent prioritization
 */
export async function searchTemplatesWithRAG(
  userId: string,
  query: string,
  limit: number = 5
): Promise<SearchResult[]> {
  const supabase = await createClient()

  // Generate embedding for the query
  const { embedding } = await generateEmbedding(query)

  // Call the database function
  const { data, error } = await supabase.rpc('search_templates_with_priority', {
    p_user_id: userId,
    p_query_embedding: embedding,
    p_query_text: query,
    p_limit: limit,
  })

  if (error) {
    console.error('Error searching templates:', error)
    throw new Error('Failed to search templates')
  }

  return data as SearchResult[]
}

/**
 * Build AI context from search results
 */
export function buildAIContext(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No relevant templates found in the platform.'
  }

  const context = results
    .map((result, index) => {
      return `
${index + 1}. ${result.name} (${result.match_reason})
   - Description: ${result.description || 'No description'}
   - Tags: ${result.tags?.join(', ') || 'None'}
   - Rating: ${result.rating_average?.toFixed(1) || 'N/A'}⭐
   - Relevance: ${(result.final_score * 100).toFixed(0)}%
   - Preview: ${result.content.substring(0, 200)}...
   - ID: ${result.agent_id}
`.trim()
    })
    .join('\n\n')

  return `
Available templates from the platform:

${context}

IMPORTANT: Only reference these templates in your response. If the user's question cannot be answered using these templates, say so clearly.
`.trim()
}
