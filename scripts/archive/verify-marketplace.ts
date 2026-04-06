import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

async function verifyMarketplace() {
  console.log('🔍 Verifying marketplace...\n')

  // Get all public agents
  const { data: agents, error } = await supabase
    .from('agent_templates')
    .select('*')
    .eq('visibility', 'public')
    .order('category', { ascending: true })

  if (error) {
    console.error('❌ Error fetching agents:', error.message)
    return
  }

  if (!agents || agents.length === 0) {
    console.log('⚠️  No public agents found in marketplace')
    return
  }

  // Group by category
  const byCategory = agents.reduce((acc, agent) => {
    if (!acc[agent.category]) {
      acc[agent.category] = []
    }
    acc[agent.category].push(agent)
    return acc
  }, {} as Record<string, typeof agents>)

  // Display summary
  console.log('📊 Marketplace Summary\n')
  console.log(`Total Public Agents: ${agents.length}\n`)

  console.log('By Category:')
  Object.entries(byCategory)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([category, categoryAgents]) => {
      console.log(`  ${category}: ${categoryAgents.length} agents`)
      categoryAgents.forEach(agent => {
        console.log(`    - ${agent.name}`)
      })
    })

  // Check for agents with embeddings
  console.log('\n🔎 Checking embeddings...')
  const { data: embeddings, error: embError } = await supabase
    .from('agent_template_embeddings')
    .select('agent_id')

  if (embError) {
    console.error('❌ Error checking embeddings:', embError.message)
  } else {
    const embeddedCount = embeddings?.length || 0
    const percentage = ((embeddedCount / agents.length) * 100).toFixed(1)
    console.log(`  ${embeddedCount}/${agents.length} agents have embeddings (${percentage}%)`)
    
    if (embeddedCount < agents.length) {
      console.log('  ⚠️  Run "npm run generate-embeddings" to enable semantic search')
    }
  }

  // Check ratings
  console.log('\n⭐ Checking ratings...')
  const agentsWithRatings = agents.filter(a => a.rating_count && a.rating_count > 0)
  console.log(`  ${agentsWithRatings.length}/${agents.length} agents have ratings`)

  // Check downloads
  console.log('\n📥 Checking downloads...')
  const agentsWithDownloads = agents.filter(a => a.download_count && a.download_count > 0)
  console.log(`  ${agentsWithDownloads.length}/${agents.length} agents have been downloaded`)

  // Top rated agents
  if (agentsWithRatings.length > 0) {
    console.log('\n🏆 Top Rated Agents:')
    const topRated = [...agents]
      .filter(a => a.rating_average && a.rating_count && a.rating_count > 0)
      .sort((a, b) => (b.rating_average || 0) - (a.rating_average || 0))
      .slice(0, 5)
    
    topRated.forEach((agent, i) => {
      console.log(`  ${i + 1}. ${agent.name} - ${agent.rating_average?.toFixed(1)}⭐ (${agent.rating_count} reviews)`)
    })
  }

  // Most downloaded
  if (agentsWithDownloads.length > 0) {
    console.log('\n📈 Most Downloaded:')
    const mostDownloaded = [...agents]
      .filter(a => a.download_count && a.download_count > 0)
      .sort((a, b) => (b.download_count || 0) - (a.download_count || 0))
      .slice(0, 5)
    
    mostDownloaded.forEach((agent, i) => {
      console.log(`  ${i + 1}. ${agent.name} - ${agent.download_count} downloads`)
    })
  }

  // Check for missing data
  console.log('\n🔧 Data Quality Check:')
  const missingDescription = agents.filter(a => !a.description || a.description.trim() === '')
  const missingTags = agents.filter(a => !a.tags || a.tags.length === 0)
  const shortContent = agents.filter(a => a.content.length < 100)

  if (missingDescription.length > 0) {
    console.log(`  ⚠️  ${missingDescription.length} agents missing descriptions`)
  }
  if (missingTags.length > 0) {
    console.log(`  ⚠️  ${missingTags.length} agents missing tags`)
  }
  if (shortContent.length > 0) {
    console.log(`  ⚠️  ${shortContent.length} agents have very short content`)
  }
  if (missingDescription.length === 0 && missingTags.length === 0 && shortContent.length === 0) {
    console.log('  ✅ All agents have complete data')
  }

  console.log('\n✨ Verification complete!')
}

verifyMarketplace()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })
