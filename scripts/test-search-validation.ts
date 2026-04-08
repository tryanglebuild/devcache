// Comprehensive test to validate search functionality
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Test user ID (from previous queries)
const TEST_USER_ID = '84372c54-75f0-45f3-99a0-c635fea3b8aa'

interface SearchTest {
  name: string
  query: string
  language: 'pt' | 'en'
  expectedKeywords: string[]
  shouldFindMarketplace: boolean
}

const searchTests: SearchTest[] = [
  // Portuguese queries
  {
    name: 'Portuguese - Simple keyword',
    query: 'kubernetes',
    language: 'pt',
    expectedKeywords: ['kubernetes', 'k8s'],
    shouldFindMarketplace: true
  },
  {
    name: 'Portuguese - Complex question',
    query: 'Existe algum documento sobre Kubernetes?',
    language: 'pt',
    expectedKeywords: ['kubernetes', 'k8s'],
    shouldFindMarketplace: true
  },
  {
    name: 'Portuguese - Natural language',
    query: 'Preciso de templates para Docker',
    language: 'pt',
    expectedKeywords: ['docker'],
    shouldFindMarketplace: true
  },
  {
    name: 'Portuguese - Multiple keywords',
    query: 'Tem algum template de React com TypeScript?',
    language: 'pt',
    expectedKeywords: ['react', 'typescript'],
    shouldFindMarketplace: true
  },
  
  // English queries
  {
    name: 'English - Simple keyword',
    query: 'terraform',
    language: 'en',
    expectedKeywords: ['terraform', 'iac'],
    shouldFindMarketplace: true
  },
  {
    name: 'English - Complex question',
    query: 'Do you have any documentation about Python?',
    language: 'en',
    expectedKeywords: ['python'],
    shouldFindMarketplace: true
  },
  {
    name: 'English - Natural language',
    query: 'I need help with API development',
    language: 'en',
    expectedKeywords: ['api'],
    shouldFindMarketplace: true
  },
  {
    name: 'English - Technical query',
    query: 'Show me templates for unit testing',
    language: 'en',
    expectedKeywords: ['test', 'testing'],
    shouldFindMarketplace: true
  }
]

async function runSearchTest(test: SearchTest): Promise<boolean> {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`🧪 Test: ${test.name}`)
  console.log(`   Query: "${test.query}"`)
  console.log(`   Language: ${test.language.toUpperCase()}`)
  console.log(`   Expected keywords: ${test.expectedKeywords.join(', ')}`)
  console.log(`${'='.repeat(80)}`)

  try {
    // Execute search
    const { data: results, error } = await supabase.rpc('search_resources_hybrid', {
      p_user_id: TEST_USER_ID,
      p_query_text: test.query,
      p_query_embedding: null, // Text-only search
      p_include_marketplace: true,
      p_limit: 10
    })

    if (error) {
      console.error('❌ Search error:', error.message)
      return false
    }

    if (!results || results.length === 0) {
      console.log('⚠️  No results found')
      return false
    }

    console.log(`\n✅ Found ${results.length} results:\n`)

    // Check if marketplace templates are included
    const marketplaceResults = results.filter((r: any) => r.resource_type === 'marketplace_template')
    const projectResults = results.filter((r: any) => r.resource_type !== 'marketplace_template')

    console.log(`   📦 Marketplace templates: ${marketplaceResults.length}`)
    console.log(`   📁 User projects: ${projectResults.length}\n`)

    // Display top 5 results
    results.slice(0, 5).forEach((result: any, idx: number) => {
      const relevancePercent = (result.relevance_score * 100).toFixed(1)
      const typeIcon = result.resource_type === 'marketplace_template' ? '🏪' : '📁'
      
      console.log(`   ${idx + 1}. ${typeIcon} ${result.name}`)
      console.log(`      Type: ${result.resource_type}`)
      console.log(`      Relevance: ${relevancePercent}%`)
      
      if (result.tags && result.tags.length > 0) {
        console.log(`      Tags: ${result.tags.join(', ')}`)
      }
      
      // Check if expected keywords are in name, description, or tags
      const hasExpectedKeyword = test.expectedKeywords.some(keyword => {
        const lowerKeyword = keyword.toLowerCase()
        const inName = result.name.toLowerCase().includes(lowerKeyword)
        const inDesc = result.description?.toLowerCase().includes(lowerKeyword)
        const inTags = result.tags?.some((tag: string) => tag.toLowerCase().includes(lowerKeyword))
        return inName || inDesc || inTags
      })
      
      if (hasExpectedKeyword) {
        console.log(`      ✓ Contains expected keyword`)
      }
      
      console.log()
    })

    // Validation checks
    let passed = true
    const issues: string[] = []

    // Check 1: Should find marketplace results
    if (test.shouldFindMarketplace && marketplaceResults.length === 0) {
      issues.push('Expected marketplace results but found none')
      passed = false
    }

    // Check 2: At least one result should contain expected keywords
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
    console.log(`\n${'─'.repeat(80)}`)
    if (passed) {
      console.log('✅ TEST PASSED')
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
  console.log('\n🚀 Starting Search Validation Tests\n')
  console.log(`Testing with user ID: ${TEST_USER_ID}`)
  console.log(`Total tests: ${searchTests.length}\n`)

  const results: { test: string; passed: boolean }[] = []

  for (const test of searchTests) {
    const passed = await runSearchTest(test)
    results.push({ test: test.name, passed })
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500))
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

  // Detailed results
  console.log('Detailed Results:')
  results.forEach((result, idx) => {
    const icon = result.passed ? '✅' : '❌'
    console.log(`  ${idx + 1}. ${icon} ${result.test}`)
  })

  console.log('\n' + '='.repeat(80))

  // Exit with appropriate code
  process.exit(failedCount > 0 ? 1 : 0)
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
