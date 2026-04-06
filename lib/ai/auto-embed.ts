// Auto-embedding helper for background embedding generation
// This file provides utilities to automatically generate embeddings after creating items

/**
 * Triggers embedding generation for an agent template in the background
 * @param agentId - The ID of the agent template
 * @param baseUrl - The base URL of the application (optional, defaults to NEXT_PUBLIC_APP_URL)
 */
export async function triggerAgentEmbedding(
  agentId: string,
  baseUrl?: string
): Promise<void> {
  const url = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  try {
    // Fire and forget - don't wait for response
    fetch(`${url}/api/embeddings/generate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ agent_id: agentId })
    }).catch(err => {
      console.error(`[Auto-Embed] Failed to generate embedding for agent ${agentId}:`, err)
    })
  } catch (error) {
    console.error(`[Auto-Embed] Error triggering embedding for agent ${agentId}:`, error)
  }
}

/**
 * Triggers embedding generation for a project item in the background
 * @param projectItemId - The ID of the project item
 * @param baseUrl - The base URL of the application (optional)
 */
export async function triggerProjectItemEmbedding(
  projectItemId: string,
  baseUrl?: string
): Promise<void> {
  const url = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  try {
    // Fire and forget - don't wait for response
    fetch(`${url}/api/embeddings/generate-project`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ project_item_id: projectItemId })
    }).catch(err => {
      console.error(`[Auto-Embed] Failed to generate embedding for project item ${projectItemId}:`, err)
    })
  } catch (error) {
    console.error(`[Auto-Embed] Error triggering embedding for project item ${projectItemId}:`, error)
  }
}
