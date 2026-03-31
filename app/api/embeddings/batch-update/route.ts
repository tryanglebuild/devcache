// Batch Update Embeddings API
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

// POST /api/embeddings/batch-update - Generate and update embeddings for items
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type = 'all', limit = 10 } = body

    // Get items needing embeddings
    const { data: items, error: itemsError } = await supabase.rpc(
      'get_items_needing_embeddings',
      {
        p_limit: limit,
        p_type: type,
      }
    )

    if (itemsError) {
      console.error('Error getting items:', itemsError)
      return NextResponse.json(
        { error: 'Failed to get items' },
        { status: 500 }
      )
    }

    if (!items || items.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No items need embeddings',
      })
    }

    // Prepare content for embedding
    const textsToEmbed = items.map((item: any) => {
      const parts = [
        item.name,
        item.description || '',
        item.tags?.join(' ') || '',
        (item.content || '').substring(0, 2000), // Limit content length
      ]
      return parts.filter(Boolean).join(' ')
    })

    // Generate embeddings in batch using OpenRouter
    const embeddingResponse = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      },
      body: JSON.stringify({
        model: 'openai/text-embedding-ada-002',
        input: textsToEmbed,
      }),
    })

    if (!embeddingResponse.ok) {
      const error = await embeddingResponse.text()
      console.error('OpenAI API error:', error)
      return NextResponse.json(
        { error: 'Failed to generate embeddings' },
        { status: 500 }
      )
    }

    const embeddingData = await embeddingResponse.json()
    
    // Prepare batch update data
    const embeddings = items.map((item: any, index: number) => ({
      id: item.id,
      type: item.type,
      embedding: embeddingData.data[index].embedding,
    }))

    // Update embeddings in database
    const { data: updateResult, error: updateError } = await supabase.rpc(
      'batch_update_embeddings',
      {
        p_embeddings: embeddings,
      }
    )

    if (updateError) {
      console.error('Error updating embeddings:', updateError)
      return NextResponse.json(
        { error: 'Failed to update embeddings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      processed: items.length,
      success_count: updateResult[0]?.success_count || 0,
      error_count: updateResult[0]?.error_count || 0,
      tokens_used: embeddingData.usage?.total_tokens || 0,
    })
  } catch (error) {
    console.error('Batch update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
