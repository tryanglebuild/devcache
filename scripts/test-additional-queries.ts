// Additional query tests for specific cases
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const TEST_USER_ID = '84372c54-75f0-45f3-99a0-c635fea3b8aa'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface TestCase {
  name: string
  query: string
  expectedInResults: string[]
  shouldFindMarketplace: boolean
}

const additionalTests: TestCase[] = [
  {
    name: 'Specific template name - Camaleon',
    query: 'Camaleon',
    expectedInResults: ['Camaleon Rules'],
    shouldFindMarketplace: true
  },
  {
    name: 'Misspelled - Camaleopn',
    query: 'Camaleopn',
    expectedInResults: ['Camaleon Rules'],
    shouldFindMarketplace: true
  },
  {
    name: 'Portuguese query - Regras do Camaleon',
    query: 'Regras do Camaleon',
    expectedInResults: ['Camaleon Rules'],
    shouldFindMarketplace: true
  },
  {
    name: 'React templates',
    query: 'React',
    expectedInResults: ['React Component Builder'],
    shouldFindMarketplace: true
  },
  {
    name: 'Docker templates',
    query: 'Docker',
    expectedInResults: ['Docker Configuration Generator', 'Docker & Kubernetes Specialist'],
    shouldFindMarketplace: true
  },
  {
    name: 'Testing templates',
    query: 'testing',
    expectedInResults: ['Unit Test Generator'],
    shouldFindMarketplace: true
  },
  {
    name: 'API templates',
    query: 'API',
    expectedInResults: ['REST API Architect'],
    shouldFindMarketplace: true
  },
  {
    name: 'Security templates',
    query: 'security',
    expectedInResults: ['Security Vulnerability Scanner', 'Security Auditor'],
    shouldFindMarketplace: true
  },
  {
    name: 'Next.js templates',
    query: 'Next.js',
    expectedInResults: ['Next.js App Router Expert'],
    shouldFindMarketplace: true
  },
  {
    name: 'Terraform templates',
    query: 'Terraform',
    expectedInResults: ['Terraform Infrastructure Coder'],
    shouldFindMarketplace: true
  }
]

async function runTest(test: TestCase): Promise<boolean> {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`🧪 Test: ${test.name}`)
  console.log(`   Query: "${test.query}"`)
  console.log(`   Expected: ${test.expectedInResults.join(', ')}`)
  console.log(`${'='.repeat(80)}`)

  try {
    const { data: results, error } = await supabase.rpc('search_resources_hybrid', {
      p_user_id: TEST_USER_ID,
      p_query_text: test.query,
      p_query_embedding: null,
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

    const marketplaceResults = results.filter((r: any) => r.resource_type === 'marketplace_template')
    console.log(`   📦 Marketplace templates: ${marketplaceResults.length}`)

    // Display results
    results.slice(0, 5).forEach((result: any, idx: number) => {
      const relevancePercent = (result.relevance_score * 100).toFixed(1)
      const typeIcon = result.resource_type === 'marketplace_template' ? '🏪' : '📁'
      
      console.log(`   ${idx + 1}. ${typeIcon} ${result.name} (${relevancePercent}%)`)
    })

    // Validation
    let passed = true
    const issues: string[] = []

    // Check if marketplace results exist
    if (test.shouldFindMarketplace && marketplaceResults.length === 0) {
      issues.push('Expected marketplace results but found none')
      passed = false
    }

    // Check if expected items are in results
    const resultNames = results.map((r: any) => r.name.toLowerCase())
    const missingExpected = test.expectedInResults.filter(expected => 
      !resultNames.some((name: string) => name.includes(expected.toLowerCase()))
    )

    if (missingExpected.length > 0) {
      issues.push(`Missing expected results: ${missingExpected.join(', ')}`)
      passed = false
    }

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
  console.log('\n🚀 Running Additional Query Tests\n')
  console.log(`Total tests: ${additionalTests.length}\n`)

  const results: { test: string; passed: boolean }[] = []

  for (const test of additionalTests) {
    const passed = await runTest(test)
    results.push({ test: test.name, passed })
    await new Promise(resolve => setTimeout(resolve, 300))
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
