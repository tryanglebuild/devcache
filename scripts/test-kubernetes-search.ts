// Test script to debug Kubernetes search issue
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'MISSING')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testKubernetesSearch() {
  console.log('🔍 Testing Kubernetes search...\n')

  // Test 1: Direct marketplace query
  console.log('Test 1: Direct marketplace query')
  const { data: templates, error: templatesError } = await supabase
    .from('agent_templates')
    .select('id, name, description, tags, visibility')
    .eq('visibility', 'public')
    .or('name.ilike.%kubernetes%,description.ilike.%kubernetes%')
    .limit(5)

  if (templatesError) {
    console.error('❌ Error:', templatesError)
  } else {
    console.log(`✅ Found ${templates.length} templates:`)
    templates.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.name}`)
      console.log(`     Tags: ${t.tags?.join(', ')}`)
    })
  }

  console.log('\n---\n')

  // Test 2: Check embeddings
  console.log('Test 2: Check embeddings for Kubernetes templates')
  const { data: embeddings, error: embError } = await supabase
    .from('agent_template_embeddings')
    .select('agent_id, embedding_vector')
    .in('agent_id', templates?.map(t => t.id) || [])

  if (embError) {
    console.error('❌ Error:', embError)
  } else {
    console.log(`✅ Found ${embeddings.length} embeddings:`)
    embeddings.forEach((e, i) => {
      const template = templates?.find(t => t.id === e.agent_id)
      console.log(`  ${i + 1}. ${template?.name}`)
      console.log(`     Has embedding: ${e.embedding_vector ? 'YES' : 'NO'}`)
    })
  }

  console.log('\n---\n')

  // Test 3: Test search_resources_hybrid function (text-only)
  console.log('Test 3: Test search_resources_hybrid (text-only, no embedding)')
  const { data: searchResults, error: searchError } = await supabase.rpc(
    'search_resources_hybrid',
    {
      p_user_id: '00000000-0000-0000-0000-000000000000', // Fake user ID
      p_query_text: 'kubernetes',
      p_query_embedding: null, // NO EMBEDDING
      p_include_marketplace: true,
      p_limit: 10,
    }
  )

  if (searchError) {
    console.error('❌ Error:', searchError)
    console.error('Error details:', JSON.stringify(searchError, null, 2))
  } else {
    console.log(`✅ Found ${searchResults.length} results:`)
    searchResults.forEach((r: any, i: number) => {
      console.log(`  ${i + 1}. ${r.name} (${r.resource_type})`)
      console.log(`     Relevance: ${(r.relevance_score * 100).toFixed(0)}%`)
      console.log(`     Similarity: ${(r.similarity_score * 100).toFixed(0)}%`)
    })
  }

  console.log('\n---\n')

  // Test 4: Generate embedding and test hybrid search
  console.log('Test 4: Test with embedding (simulated)')
  console.log('⚠️  Skipping - requires OpenRouter API key')
  console.log('    In production, embedding would be generated via OpenRouter')
}

testKubernetesSearch().catch(console.error)
