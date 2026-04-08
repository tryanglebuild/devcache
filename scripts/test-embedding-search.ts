// Test embedding generation and search with embeddings
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!
const TEST_USER_ID = '84372c54-75f0-45f3-99a0-c635fea3b8aa'

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

interface EmbeddingTest {
  name: string
  query: string
  language: 'pt' | 'en'
  expectedKeywords: string[]
}

const embeddingTests: EmbeddingTest[] = [
  // Portuguese tests
  {
    name: 'Portuguese - Kubernetes',
    query: 'Preciso de ajuda com Kubernetes',
    language: 'pt',
    expectedKeywords: ['kubernetes', 'k8s', 'docker']
  },
  {
    name: 'Portuguese - React',
    query: 'Como criar componentes React?',
    language: 'pt',
    expectedKeywords: ['react', 'component']
  },
  {
    name: 'Portuguese - Docker',
    query: 'Configuração de containers Docker',
    language: 'pt',
    expectedKeywords: ['docker', 'container']
  },
  {
    name: 'Portuguese - Testing',
    query: 'Testes unitários automatizados',
    language: 'pt',
    expectedKeywords: ['test', 'unit']
  },
  
  // English tests
  {
    name: 'English - Kubernetes',
    query: 'I need help with Kubernetes deployment',
    language: 'en',
    expectedKeywords: ['kubernetes', 'k8s', 'docker']
  },
  {
    name: 'English - React',
    query: 'How to build React components?',
    language: 'en',
    expectedKeywords: ['react', 'component']
  },
  {
    name: 'English - API',
    query: 'REST API development best practices',
    language: 'en',
    expectedKeywords: ['api', 'rest']
  },
  {
    name: 'English - Security',
    query: 'Security vulnerability scanning',
    language: 'en',
    expectedKeywords: ['security', 'vulnerability']
  }
]

async function runEmbeddingTest(test: EmbeddingTest): Promise<boolean> {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`🧪 Test: ${test.name}`)
  console.log(`   Query: "${test.query}"`)
  console.log(`   Language: ${test.language.toUpperCase()}`)
  console.log(`   Expected keywords: ${test.expectedKeywords.join(', ')}`)
  console.log(`${'='.repeat(80)}`)

  try {
    // Step 1: Generate embedding
    console.log('\n📊 Step 1: Generating embedding...')
    const embedding = await generateEmbedding(test.query)
    
    if (!embedding) {
      console.error('❌ Failed to generate embedding')
      return false
    }
    
    console.log(`✅ Embedding generated (${embedding.length} dimensions)`)
    console.log(`   First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}]`)

    // Step 2: Search with embedding
    console.log('\n🔍 Step 2: Searching with embedding...')
    const { data: results, error } = await supabase.rpc('search_resources_hybrid', {
      p_user_id: TEST_USER_ID,
      p_query_text: test.query,
      p_query_embedding: `[${embedding.join(',')}]`,
      p_include_marketplace: true,
      p_limit: 5
    })

    if (error) {
      console.error('❌ Search error:', error.message)
      return false
    }

    if (!results || results.length === 0) {
      console.log('⚠️  No results found')
      return false
    }

    console.log(`✅ Found ${results.length} results\n`)

    // Display results
    const marketplaceResults = results.filter((r: any) => r.resource_type === 'marketplace_template')
    console.log(`   📦 Marketplace templates: ${marketplaceResults.length}`)
    console.log(`   📁 User projects: ${results.length - marketplaceResults.length}\n`)

    results.forEach((result: any, idx: number) => {
      const relevancePercent = (result.relevance_score * 100).toFixed(1)
      const similarityPercent = (result.similarity_score * 100).toFixed(1)
      const typeIcon = result.resource_type === 'marketplace_template' ? '🏪' : '📁'
      
      console.log(`   ${idx + 1}. ${typeIcon} ${result.name}`)
      console.log(`      Relevance: ${relevancePercent}% | Similarity: ${similarityPercent}%`)
      
      if (result.tags && result.tags.length > 0) {
        console.log(`      Tags: ${result.tags.join(', ')}`)
      }
      
      // Check if result contains expected keywords
      const hasKeyword = test.expectedKeywords.some(keyword => {
        const lowerKeyword = keyword.toLowerCase()
        const inName = result.name.toLowerCase().includes(lowerKeyword)
        const inDesc = result.description?.toLowerCase().includes(lowerKeyword)
        const inTags = result.tags?.some((tag: string) => tag.toLowerCase().includes(lowerKeyword))
        return inName || inDesc || inTags
      })
      
      if (hasKeyword) {
        console.log(`      ✓ Contains expected keyword`)
      }
      
      console.log()
    })

    // Validation
    let passed = true
    const issues: string[] = []

    // Check 1: Should have marketplace results
    if (marketplaceResults.length === 0) {
      issues.push('No marketplace results found')
      passed = false
    }

    // Check 2: Top result should have high similarity (> 60%)
    const topResult = results[0]
    if (topResult.similarity_score < 0.6) {
      issues.push(`Top result has low similarity: ${(topResult.similarity_score * 100).toFixed(1)}%`)
      passed = false
    }

    // Check 3: At least one result should contain expected keywords
    const hasRelevantResults = results.some((result: any) => {
      return test.expectedKeywords.some(keyword => {
        const lowerKeyword = keyword.toLowerCase()
        const inName = result.name.toLowerCase().includes(lowerKeyword)
        const inDesc = result.description?.toLowerCase().includes(lowerKeyword)
        const inTags = result.tags?.some((tag: string) => tag.toLowerCase().includes(lowerKeyword))
        return inName || inDesc || inTags
      })
    })

    if (!hasRelevantResults) {
      issues.push(`No results contain expected keywords: ${test.expectedKeywords.join(', ')}`)
      passed = false
    }

    // Print validation result
    console.log(`${'─'.repeat(80)}`)
    if (passed) {
      console.log('✅ TEST PASSED')
      console.log(`   - Embedding generated successfully`)
      console.log(`   - Found ${marketplaceResults.length} marketplace results`)
      console.log(`   - Top similarity: ${(topResult.similarity_score * 100).toFixed(1)}%`)
      console.log(`   - Relevant results found`)
    } else {
      console.log('❌ TEST FAILED')
      issues.forEach(issue => console.log(`   - ${issue}`))
    }
    console.log(`${'─'.repeat(80)}`)

    return passed

  } catch (error) {
    console.error('❌ Test execution error:', error)
    return false
  }
}

async function main() {
  console.log('\n🚀 Testing Embedding Generation and Search\n')
  console.log(`Total tests: ${embeddingTests.length}\n`)

  const results: { test: string; passed: boolean }[] = []

  for (const test of embeddingTests) {
    const passed = await runEmbeddingTest(test)
    results.push({ test: test.name, passed })
    
    // Delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Summary
  console.log('\n\n' + '='.repeat(80))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(80))

  const passedCount = results.filter(r => r.passed).length
  const failedCount = results.filter(r => !r.passed).length

  console.log(`\nTotal: ${results.length} tests`)
  console.log(`✅ Passed: ${passedCount}`)
  console.log(`❌ Failed: ${failedCount}`)
  console.log(`Success rate: ${((passedCount / results.length) * 100).toFixed(1)}%\n`)

  // Group by language
  const ptTests = results.filter(r => r.test.includes('Portuguese'))
  const enTests = results.filter(r => r.test.includes('English'))

  console.log('By Language:')
  console.log(`  Portuguese: ${ptTests.filter(r => r.passed).length}/${ptTests.length} passed`)
  console.log(`  English: ${enTests.filter(r => r.passed).length}/${enTests.length} passed\n`)

  console.log('Detailed Results:')
  results.forEach((result, idx) => {
    const icon = result.passed ? '✅' : '❌'
    console.log(`  ${idx + 1}. ${icon} ${result.test}`)
  })

  console.log('\n' + '='.repeat(80))

  process.exit(failedCount > 0 ? 1 : 0)
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
