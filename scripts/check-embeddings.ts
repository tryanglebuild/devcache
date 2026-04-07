#!/usr/bin/env tsx
/**
 * Check Embeddings Script
 * 
 * This script checks the embedding status of all templates and project items.
 * Shows detailed statistics and identifies items without embeddings.
 * 
 * Usage:
 *   npm run check-embeddings
 *   or
 *   tsx scripts/check-embeddings.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

interface EmbeddingStats {
  total_agents: number
  agents_with_embeddings: number
  agents_pending: number
  total_project_items: number
  project_items_with_embeddings: number
  project_items_pending: number
  last_check: string
}

interface PendingItem {
  id: string
  type: 'agent' | 'project'
  name: string
  description: string | null
  user_id: string
  created_at: string
  updated_at: string
}

async function getEmbeddingStats(): Promise<EmbeddingStats> {
  const { data, error } = await supabase.rpc('get_embedding_stats')

  if (error) {
    throw new Error(`Failed to get stats: ${error.message}`)
  }

  return data?.[0]
}

async function getPendingItems(limit: number = 100): Promise<PendingItem[]> {
  const { data, error } = await supabase.rpc('get_pending_embeddings', {
    p_limit: limit,
  })

  if (error) {
    throw new Error(`Failed to get pending items: ${error.message}`)
  }

  return data || []
}

async function getCronLogs(limit: number = 5) {
  const { data, error } = await supabase
    .from('embedding_cron_logs')
    .select('*')
    .order('run_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.warn('⚠️  Could not fetch cron logs:', error.message)
    return []
  }

  return data || []
}

function createProgressBar(percentage: number, length: number = 40): string {
  const filled = Math.round((percentage / 100) * length)
  const empty = length - filled
  return '█'.repeat(filled) + '░'.repeat(empty)
}

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('📊 EMBEDDING STATUS REPORT')
  console.log('='.repeat(60) + '\n')

  // Get statistics
  console.log('📈 Fetching statistics...\n')
  const stats = await getEmbeddingStats()

  // Project Items Section
  console.log('📁 PROJECT FILES:')
  console.log('─'.repeat(60))
  
  const projectPercentage = stats.total_project_items > 0
    ? Math.round((stats.project_items_with_embeddings / stats.total_project_items) * 100)
    : 0

  console.log(`   Total files:          ${stats.total_project_items}`)
  console.log(`   With embeddings:      ${stats.project_items_with_embeddings} (${projectPercentage}%)`)
  console.log(`   Pending:              ${stats.project_items_pending}`)
  console.log(`\n   Progress: ${createProgressBar(projectPercentage)} ${projectPercentage}%\n`)

  // Agent Templates Section
  console.log('🤖 AGENT TEMPLATES (Public):')
  console.log('─'.repeat(60))
  
  const agentPercentage = stats.total_agents > 0
    ? Math.round((stats.agents_with_embeddings / stats.total_agents) * 100)
    : 0

  console.log(`   Total agents:         ${stats.total_agents}`)
  console.log(`   With embeddings:      ${stats.agents_with_embeddings} (${agentPercentage}%)`)
  console.log(`   Pending:              ${stats.agents_pending}`)
  console.log(`\n   Progress: ${createProgressBar(agentPercentage)} ${agentPercentage}%\n`)

  // Overall Status
  const totalPending = stats.project_items_pending + stats.agents_pending
  const totalItems = stats.total_project_items + stats.total_agents
  const totalWithEmbeddings = stats.project_items_with_embeddings + stats.agents_with_embeddings
  const overallPercentage = totalItems > 0
    ? Math.round((totalWithEmbeddings / totalItems) * 100)
    : 0

  console.log('📊 OVERALL STATUS:')
  console.log('─'.repeat(60))
  console.log(`   Total items:          ${totalItems}`)
  console.log(`   With embeddings:      ${totalWithEmbeddings} (${overallPercentage}%)`)
  console.log(`   Pending:              ${totalPending}`)
  console.log(`\n   Overall: ${createProgressBar(overallPercentage)} ${overallPercentage}%\n`)

  if (totalPending === 0) {
    console.log('✅ All items have embeddings!')
    console.log('   Your documentation is fully searchable by AI.\n')
  } else {
    console.log(`⚠️  ${totalPending} item(s) need embeddings`)
    console.log('   Run the embedding generation script to process them.\n')
  }

  // Pending Items Details
  if (totalPending > 0) {
    console.log('📋 PENDING ITEMS (First 10):')
    console.log('─'.repeat(60))
    
    const pendingItems = await getPendingItems(10)
    
    if (pendingItems.length > 0) {
      pendingItems.forEach((item, index) => {
        const icon = item.type === 'agent' ? '🤖' : '📄'
        const date = new Date(item.created_at).toLocaleDateString()
        console.log(`   ${index + 1}. ${icon} ${item.name}`)
        console.log(`      Type: ${item.type} | Created: ${date}`)
        if (item.description) {
          const desc = item.description.substring(0, 60)
          console.log(`      ${desc}${item.description.length > 60 ? '...' : ''}`)
        }
        console.log()
      })
      
      if (totalPending > 10) {
        console.log(`   ... and ${totalPending - 10} more items\n`)
      }
    }
  }

  // Recent Cron Jobs
  console.log('🕐 RECENT EMBEDDING JOBS:')
  console.log('─'.repeat(60))
  
  const cronLogs = await getCronLogs(5)
  
  if (cronLogs.length > 0) {
    cronLogs.forEach((log, index) => {
      const date = new Date(log.run_at).toLocaleString()
      const status = log.error_message ? '❌ Failed' : '✅ Success'
      
      console.log(`   ${index + 1}. ${date}`)
      console.log(`      Status: ${status}`)
      console.log(`      Processed: ${log.items_processed} | Succeeded: ${log.items_succeeded} | Failed: ${log.items_failed}`)
      console.log(`      Time: ${log.execution_time_ms}ms`)
      
      if (log.error_message) {
        console.log(`      Error: ${log.error_message.substring(0, 100)}`)
      }
      console.log()
    })
  } else {
    console.log('   No recent jobs found\n')
  }

  // Recommendations
  console.log('💡 RECOMMENDATIONS:')
  console.log('─'.repeat(60))
  
  if (totalPending > 0) {
    console.log('   1. Run: npm run generate-embeddings')
    console.log('      or: tsx scripts/generate-embeddings-v2.ts')
    console.log('   2. Or wait for the weekly cron job (Sundays at 2 AM UTC)')
    console.log('   3. Or use CLI: devcache embeddings --trigger')
  } else {
    console.log('   ✅ Everything looks good!')
    console.log('   Your embeddings are up to date.')
  }
  
  console.log()
  console.log('─'.repeat(60))
  console.log(`Last checked: ${new Date(stats.last_check).toLocaleString()}`)
  console.log('='.repeat(60) + '\n')
}

// Run the script
main().catch((error) => {
  console.error('\n❌ Error:', error.message)
  console.error('\nStack trace:', error.stack)
  process.exit(1)
})
