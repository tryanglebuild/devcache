// Embeddings Integration using OpenRouter
export interface EmbeddingResult {
  embedding: number[]
  tokens: number
}

/**
 * Generate embedding for text using OpenRouter
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
 * Prepare template content for embedding
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
