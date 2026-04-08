// Test the complete search flow as done in the edge function
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!

if (!supabaseUrl || !supabaseServiceKey || !OPENROUTER_API_KEY) {
  console.error('❌ Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://kiro-agent.com',
      },
      body: JSON.stringify({
        model: 'openai/text-embedding-ada-002',
        input: text,
      }),
    })

    if (!response.ok) {
      console.error('Embedding generation failed:', await response.text())
      return null
    }

    const data = await response.json()
    return data.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    return null
  }
}

async function testFullSearchFlow(query: string, userId: string = '00000000-0000-0000-0000-000000000000') {
  console.log(`\n🔍 Testing full search flow for: "${query}"\n`)

  // Step 1: Generate embedding
  console.log('Step 1: Generating embedding...')
  const queryEmbedding = await generateEmbedding(query)
  console.log('- Embedding generated:', queryEmbedding ? 'YES' : 'NO')
  console.log('- Embedding length:', queryEmbedding ? queryEmbedding.length : 0)

  let searchResults: any[] = []

  if (queryEmbedding) {
    // Step 2: Hybrid search with embedding
    console.log('\nStep 2: Calling search_resources_hybrid with embedding...')
    const { data, error: searchError } = await supabase.rpc('search_resources_hybrid', {
      p_user_id: userId,
      p_query_text: query,
      p_query_embedding: `[${queryEmbedding.join(',')}]`,
      p_include_marketplace: true,
      p_limit: 5,
    })

    if (searchError) {
      console.error('❌ Search error:', searchError)
      console.error('Error details:', JSON.stringify(searchError, null, 2))
      console.log('\n🔄 Falling back to text-only search...')

      // Fallback: text-only search
      const [projectResults, marketplaceResults] = await Promise.all([
        supabase
          .from('project_items')
          .select('id, name, description, type, language_tags, content')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .or(`name.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`)
          .limit(3),
        supabase
          .from('agent_templates')
          .select('id, name, description, tags, content')
          .eq('visibility', 'public')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`)
          .limit(3)
      ])

      const projectItems = (projectResults.data || []).map((item: any) => ({
        resource_type: item.type === 'folder' ? 'project_folder' : 'project_item',
        resource_id: item.id,
        name: item.name,
        description: item.description,
        tags: item.language_tags || [],
        content_preview: item.content ? item.content.substring(0, 200) : '',
        relevance_score: 0.6,
        similarity_score: 0
      }))

      const marketplaceItems = (marketplaceResults.data || []).map((item: any) => ({
        resource_type: 'marketplace_template',
        resource_id: item.id,
        name: item.name,
        description: item.description,
        tags: item.tags || [],
        content_preview: item.content ? item.content.substring(0, 200) : '',
        relevance_score: 0.5,
        similarity_score: 0
      }))

      searchResults = [...projectItems, ...marketplaceItems]
      console.log('✅ Fallback search completed:', searchResults.length, 'results')
    } else {
      searchResults = data || []
      console.log('✅ Hybrid search successful:', searchResults.length, 'results')
    }
  } else {
    console.warn('\n⚠️  Failed to generate embedding, using text-only search')

    // Fallback: text-only search
    const [projectResults, marketplaceResults] = await Promise.all([
      supabase
        .from('project_items')
        .select('id, name, description, type, language_tags, content')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(3),
      supabase
        .from('agent_templates')
        .select('id, name, description, tags, content')
        .eq('visibility', 'public')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(3)
    ])

    const projectItems = (projectResults.data || []).map((item: any) => ({
      resource_type: item.type === 'folder' ? 'project_folder' : 'project_item',
      resource_id: item.id,
      name: item.name,
      description: item.description,
      tags: item.language_tags || [],
      content_preview: item.content ? item.content.substring(0, 200) : '',
      relevance_score: 0.6,
      similarity_score: 0
    }))

    const marketplaceItems = (marketplaceResults.data || []).map((item: any) => ({
      resource_type: 'marketplace_template',
      resource_id: item.id,
      name: item.name,
      description: item.description,
      tags: item.tags || [],
      content_preview: item.content ? item.content.substring(0, 200) : '',
      relevance_score: 0.5,
      similarity_score: 0
    }))

    searchResults = [...projectItems, ...marketplaceItems]
    console.log('✅ Text-only search completed:', searchResults.length, 'results')
  }

  // Step 3: Display results
  console.log('\n📊 Search Results:')
  if (searchResults.length > 0) {
    searchResults.forEach((r: any, i: number) => {
      console.log(`\n  ${i + 1}. ${r.name}`)
      console.log(`     Type: ${r.resource_type}`)
      console.log(`     Relevance: ${(r.relevance_score * 100).toFixed(0)}%`)
      console.log(`     Similarity: ${(r.similarity_score * 100).toFixed(0)}%`)
      console.log(`     Description: ${r.description?.substring(0, 80)}...`)
    })
  } else {
    console.log('  ❌ No results found!')
  }

  return searchResults
}

async function main() {
  console.log('🧪 Testing Full Search Flow (Edge Function Simulation)\n')
  console.log('=' .repeat(60))

  // Test 1: Simple query
  await testFullSearchFlow('kubernetes')

  console.log('\n' + '='.repeat(60))

  // Test 2: Portuguese query
  await testFullSearchFlow('Existe algum documento sobre Kubernetes?')

  console.log('\n' + '='.repeat(60))

  // Test 3: Complex query
  await testFullSearchFlow('I need templates for Kubernetes deployment')

  console.log('\n✅ All tests completed!')
}

main().catch(console.error)
