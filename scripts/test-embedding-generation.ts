// Test embedding generation via OpenRouter
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!

if (!OPENROUTER_API_KEY) {
  console.error('❌ Missing OPENROUTER_API_KEY!')
  process.exit(1)
}

async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    console.log(`🔍 Generating embedding for: "${text}"`)
    
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

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Embedding generation failed:', errorText)
      return null
    }

    const data = await response.json()
    console.log('✅ Embedding generated successfully')
    console.log('Embedding length:', data.data[0].embedding.length)
    console.log('First 5 values:', data.data[0].embedding.slice(0, 5))
    
    return data.data[0].embedding
  } catch (error) {
    console.error('❌ Error generating embedding:', error)
    return null
  }
}

async function testEmbeddings() {
  console.log('🧪 Testing embedding generation...\n')

  // Test 1: Simple query
  const embedding1 = await generateEmbedding('kubernetes')
  console.log('\n---\n')

  // Test 2: Portuguese query
  const embedding2 = await generateEmbedding('Existe algum documento sobre Kubernetes?')
  console.log('\n---\n')

  // Test 3: Complex query
  const embedding3 = await generateEmbedding('I need help with Kubernetes deployment and orchestration')
  
  console.log('\n📊 Summary:')
  console.log('Test 1 (simple):', embedding1 ? '✅ SUCCESS' : '❌ FAILED')
  console.log('Test 2 (Portuguese):', embedding2 ? '✅ SUCCESS' : '❌ FAILED')
  console.log('Test 3 (complex):', embedding3 ? '✅ SUCCESS' : '❌ FAILED')
}

testEmbeddings().catch(console.error)
