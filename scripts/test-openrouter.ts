#!/usr/bin/env tsx
/**
 * Test OpenRouter Connection
 * 
 * Quick test to verify OpenRouter API key and configuration
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

if (!OPENROUTER_API_KEY) {
  console.error('❌ OPENROUTER_API_KEY not found in environment')
  console.error('\n💡 Make sure .env.local exists and contains:')
  console.error('   OPENROUTER_API_KEY=sk-or-v1-...')
  process.exit(1)
}

console.log('🧪 Testing OpenRouter Connection...\n')
console.log(`🔑 API Key: ${OPENROUTER_API_KEY.substring(0, 20)}...`)
console.log(`🌐 Referer: ${APP_URL}\n`)

async function testConnection() {
  try {
    console.log('📡 Sending test request...')
    
    const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': APP_URL,
        'X-Title': 'DevCache',
      },
      body: JSON.stringify({
        model: 'openai/text-embedding-ada-002',
        input: ['Test connection'],
      }),
    })

    console.log(`📊 Response Status: ${response.status} ${response.statusText}\n`)

    if (!response.ok) {
      const errorText = await response.text()
      let errorDetails
      try {
        errorDetails = JSON.parse(errorText)
      } catch {
        errorDetails = { message: errorText }
      }
      
      console.error('❌ Error Details:')
      console.error(JSON.stringify(errorDetails, null, 2))
      
      if (response.status === 401) {
        console.error('\n💡 Troubleshooting:')
        console.error('   1. Verify API key is correct')
        console.error('   2. Check if key was regenerated recently')
        console.error('   3. Ensure account has credits')
        console.error('   4. Visit: https://openrouter.ai/keys')
      }
      
      process.exit(1)
    }

    const data = await response.json()
    
    console.log('✅ Connection successful!')
    console.log(`📦 Embedding dimensions: ${data.data[0].embedding.length}`)
    console.log(`💰 Tokens used: ${data.usage?.total_tokens || 'N/A'}`)
    console.log('\n🎉 OpenRouter is configured correctly!')
    console.log('   You can now run: npm run generate-embeddings')
    
  } catch (error) {
    console.error('❌ Connection failed:', error)
    process.exit(1)
  }
}

testConnection()
