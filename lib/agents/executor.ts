/**
 * Agent Execution Engine
 * Handles agent execution, parameter validation, and result processing
 */

import { createClient } from '@/lib/supabase/client'
import type { AgentTemplate } from '@/types/agents.types'

export interface AgentContext {
  userId: string
  agentId: string
  parameters: Record<string, any>
  metadata?: Record<string, any>
}

export interface AgentExecutionResult {
  executionId: string
  status: 'completed' | 'failed'
  output?: any
  error?: string
  executionTimeMs: number
}

export interface ExecutionStatus {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress?: number
  message?: string
}

/**
 * Execute an agent with given context and parameters
 */
export async function executeAgent(
  context: AgentContext
): Promise<AgentExecutionResult> {
  const startTime = Date.now()
  const supabase = createClient()

  try {
    // Create execution record
    const { data: execution, error: createError } = await supabase
      .from('agent_executions')
      .insert({
        user_id: context.userId,
        agent_id: context.agentId,
        input_context: {
          parameters: context.parameters,
          metadata: context.metadata || {}
        },
        status: 'running'
      })
      .select()
      .single()

    if (createError || !execution) {
      throw new Error('Failed to create execution record')
    }

    // Fetch agent template
    const { data: agent, error: agentError } = await supabase
      .from('agent_templates')
      .select('*')
      .eq('id', context.agentId)
      .single()

    if (agentError || !agent) {
      throw new Error('Agent not found')
    }

    // Parse and validate agent
    const parsedAgent = parseAgentTemplate(agent.content)
    const validation = validateAgentExecution(parsedAgent, context.parameters)

    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }

    // Execute agent logic (simulated for now)
    const result = await simulateAgentExecution(agent, context.parameters)

    const executionTimeMs = Date.now() - startTime

    // Update execution record with result
    await supabase
      .from('agent_executions')
      .update({
        status: 'completed',
        output_result: result,
        execution_time_ms: executionTimeMs,
        completed_at: new Date().toISOString()
      })
      .eq('id', execution.id)

    return {
      executionId: execution.id,
      status: 'completed',
      output: result,
      executionTimeMs
    }
  } catch (error) {
    const executionTimeMs = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Try to update execution record with error
    try {
      const { data: executions } = await supabase
        .from('agent_executions')
        .select('id')
        .eq('user_id', context.userId)
        .eq('agent_id', context.agentId)
        .eq('status', 'running')
        .order('created_at', { ascending: false })
        .limit(1)

      if (executions && executions.length > 0) {
        await supabase
          .from('agent_executions')
          .update({
            status: 'failed',
            error_message: errorMessage,
            execution_time_ms: executionTimeMs,
            completed_at: new Date().toISOString()
          })
          .eq('id', executions[0].id)
      }
    } catch (updateError) {
      console.error('Failed to update execution record:', updateError)
    }

    return {
      executionId: '',
      status: 'failed',
      error: errorMessage,
      executionTimeMs
    }
  }
}

/**
 * Parse agent template content
 */
export function parseAgentTemplate(content: string): ParsedAgent {
  // Simple parser - extracts frontmatter and content
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)

  if (match) {
    const frontmatter = match[1]
    const body = match[2]

    // Parse YAML-like frontmatter (simplified)
    const metadata: Record<string, any> = {}
    frontmatter.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':')
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim()
        metadata[key.trim()] = value
      }
    })

    return {
      metadata,
      content: body.trim(),
      parameters: extractParameters(body)
    }
  }

  return {
    metadata: {},
    content: content.trim(),
    parameters: extractParameters(content)
  }
}

/**
 * Extract parameters from agent content
 */
function extractParameters(content: string): AgentParameter[] {
  const parameters: AgentParameter[] = []
  const paramRegex = /\{\{(\w+)(?::(\w+))?\}\}/g
  let match

  while ((match = paramRegex.exec(content)) !== null) {
    const name = match[1]
    const type = match[2] || 'string'

    if (!parameters.find(p => p.name === name)) {
      parameters.push({
        name,
        type: type as 'string' | 'number' | 'boolean' | 'array' | 'object',
        required: true
      })
    }
  }

  return parameters
}

/**
 * Validate agent execution
 */
export function validateAgentExecution(
  agent: ParsedAgent,
  parameters: Record<string, any>
): ValidationResult {
  const errors: string[] = []

  // Check required parameters
  agent.parameters.forEach(param => {
    if (param.required && !(param.name in parameters)) {
      errors.push(`Missing required parameter: ${param.name}`)
    }

    // Type validation
    if (param.name in parameters) {
      const value = parameters[param.name]
      const actualType = Array.isArray(value) ? 'array' : typeof value

      if (param.type !== actualType && param.type !== 'string') {
        errors.push(
          `Parameter ${param.name} should be ${param.type}, got ${actualType}`
        )
      }
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Simulate agent execution (placeholder for actual LLM integration)
 */
async function simulateAgentExecution(
  agent: AgentTemplate,
  parameters: Record<string, any>
): Promise<any> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

  // Replace parameters in content
  let processedContent = agent.content
  Object.entries(parameters).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}(?::\\w+)?\\}\\}`, 'g')
    processedContent = processedContent.replace(regex, String(value))
  })

  return {
    agent_name: agent.name,
    agent_version: agent.version,
    processed_content: processedContent,
    parameters_used: parameters,
    timestamp: new Date().toISOString(),
    message: `Agent "${agent.name}" executed successfully with provided parameters.`
  }
}

/**
 * Get execution status
 */
export async function getExecutionStatus(
  executionId: string
): Promise<ExecutionStatus | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('agent_executions')
    .select('id, status, error_message')
    .eq('id', executionId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    status: data.status as ExecutionStatus['status'],
    message: data.error_message || undefined
  }
}

// Type definitions
export interface ParsedAgent {
  metadata: Record<string, any>
  content: string
  parameters: AgentParameter[]
}

export interface AgentParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  required: boolean
  description?: string
  default?: any
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}
