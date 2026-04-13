// Embeddings Integration using OpenRouter
// Central module for generating vector embeddings used by the RAG search system.
// All items (templates, project files) must be embedded before they can be found via semantic search.

export interface EmbeddingResult {
  embedding: number[]  // 1536-dimensional float vector (text-embedding-ada-002 output)
  tokens: number       // Number of tokens consumed (for cost tracking)
}

/**
 * Generate embedding for text using OpenRouter (text-embedding-ada-002 model).
 * The resulting vector is stored in the database for later semantic search.
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://devcache.dev',
      },
      body: JSON.stringify({
        model: 'openai/text-embedding-ada-002',
        input: text,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      embedding: data.data[0].embedding,
      tokens: data.usage?.total_tokens || 0,
    }
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error('Failed to generate embedding')
  }
}

/**
 * Prepare template content for embedding by combining metadata and content.
 * Concatenating title + description + tags + content produces richer embeddings
 * than embedding raw content alone, improving search relevance.
 */
export function prepareTemplateContent(template: {
  name: string
  description?: string
  content: string
  tags?: string[]
}): string {
  const parts = [
    `Title: ${template.name}`,
    template.description ? `Description: ${template.description}` : '',
    template.tags?.length ? `Tags: ${template.tags.join(', ')}` : '',
    `Content: ${template.content.substring(0, 2000)}`, // Limit content
  ]

  return parts.filter(Boolean).join('\n\n')
}
