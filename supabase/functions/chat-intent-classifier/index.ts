// Chat Intent Classifier - Analyzes user intent and context sufficiency
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface IntentAnalysisRequest {
  message: string
  conversationHistory: Array<{ role: string; content: string }>
  currentContext: Record<string, any>
  userLanguage?: string
}

interface IntentAnalysis {
  needsResource: boolean
  hasSufficientContext: boolean
  confidenceScore: number
  suggestedQuestions: string[]
  collectedInfo: Record<string, any>
  reasoning: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get JWT from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create Supabase client with user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    )

    // Validate JWT and get user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { message, conversationHistory, currentContext, userLanguage = 'en' }: IntentAnalysisRequest =
      await req.json()

    if (!message) {
      return new Response(JSON.stringify({ error: 'message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Analyze intent using Claude Haiku (fast and cheap)
    const analysis = await analyzeIntent(message, conversationHistory, currentContext, userLanguage)

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function analyzeIntent(
  message: string,
  conversationHistory: Array<{ role: string; content: string }>,
  currentContext: Record<string, any>,
  userLanguage: string
): Promise<IntentAnalysis> {
  const systemPrompt = buildAnalysisPrompt(currentContext, userLanguage)

  // Build conversation context (last 3 messages for efficiency)
  const recentHistory = conversationHistory.slice(-3)
  const historyText = recentHistory
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join('\n')

  const userPrompt = `
Recent conversation:
${historyText}

Current message: "${message}"

Current collected context: ${JSON.stringify(currentContext, null, 2)}

Analyze this message and respond in JSON format.
`.trim()

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('APP_URL') ?? '',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku', // Fast and cheap model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3, // Lower temperature for more consistent analysis
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content in OpenRouter response')
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response')
    }

    const analysis: IntentAnalysis = JSON.parse(jsonMatch[0])

    // Validate and set defaults
    return {
      needsResource: analysis.needsResource ?? false,
      hasSufficientContext: analysis.hasSufficientContext ?? false,
      confidenceScore: Math.min(Math.max(analysis.confidenceScore ?? 0.5, 0), 1),
      suggestedQuestions: analysis.suggestedQuestions ?? [],
      collectedInfo: analysis.collectedInfo ?? currentContext,
      reasoning: analysis.reasoning ?? '',
    }
  } catch (error) {
    console.error('Intent analysis error:', error)
    // Return safe defaults on error
    return {
      needsResource: false,
      hasSufficientContext: true,
      confidenceScore: 0.5,
      suggestedQuestions: [],
      collectedInfo: currentContext,
      reasoning: 'Error during analysis, defaulting to normal response',
    }
  }
}

function buildAnalysisPrompt(currentContext: Record<string, any>, userLanguage: string): string {
  const languageInstructions = userLanguage === 'pt' || userLanguage === 'pt-BR'
    ? 'Respond with questions in Portuguese (pt-BR).'
    : 'Respond with questions in English.'

  return `You are an intent classifier for a development resources platform (DevCache).

Your job is to analyze if the user needs a resource (file, folder, component, template) and if we have enough context to search effectively.

## Context Fields to Collect:
- resource_type: "component" | "template" | "file" | "folder" | "snippet" | "documentation"
- technology: "react" | "vue" | "angular" | "node" | "python" | etc.
- purpose: what the user wants to do (e.g., "authentication", "form validation", "api integration")
- complexity: "simple" | "medium" | "complex"
- features: array of specific features needed

## Decision Rules:

1. **needsResource = true** if user is:
   - Looking for code/components/templates
   - Asking "do you have...", "I need...", "show me..."
   - Requesting specific functionality

2. **needsResource = false** if user is:
   - Just chatting/greeting
   - Asking general questions
   - Providing answers to clarifying questions

3. **hasSufficientContext = true** if we know:
   - What type of resource (component/file/etc)
   - What technology/language
   - What purpose/functionality
   - Complexity level (optional but helpful)

4. **hasSufficientContext = false** if missing critical info

## Response Format (JSON):
{
  "needsResource": boolean,
  "hasSufficientContext": boolean,
  "confidenceScore": 0.0-1.0,
  "suggestedQuestions": ["question1", "question2"],
  "collectedInfo": {
    "resource_type": "...",
    "technology": "...",
    "purpose": "...",
    "complexity": "..."
  },
  "reasoning": "Brief explanation of your decision"
}

${languageInstructions}

## Examples:

User: "I need a component"
{
  "needsResource": true,
  "hasSufficientContext": false,
  "confidenceScore": 0.9,
  "suggestedQuestions": ["What technology are you using? (React, Vue, Angular...)", "What is the component for?"],
  "collectedInfo": {
    "resource_type": "component"
  },
  "reasoning": "User needs a component but didn't specify technology or purpose"
}

User: "React, for authentication"
{
  "needsResource": true,
  "hasSufficientContext": false,
  "confidenceScore": 0.85,
  "suggestedQuestions": ["Do you need something simple or with advanced features?"],
  "collectedInfo": {
    "resource_type": "component",
    "technology": "react",
    "purpose": "authentication"
  },
  "reasoning": "Have tech and purpose, but complexity would help narrow search"
}

User: "Simple, just login and logout"
{
  "needsResource": true,
  "hasSufficientContext": true,
  "confidenceScore": 0.95,
  "suggestedQuestions": [],
  "collectedInfo": {
    "resource_type": "component",
    "technology": "react",
    "purpose": "authentication",
    "complexity": "simple",
    "features": ["login", "logout"]
  },
  "reasoning": "Have all necessary context to perform effective search"
}

User: "Hello!"
{
  "needsResource": false,
  "hasSufficientContext": true,
  "confidenceScore": 1.0,
  "suggestedQuestions": [],
  "collectedInfo": {},
  "reasoning": "Just a greeting, no resource needed"
}

Current context already collected: ${JSON.stringify(currentContext)}

Analyze the new message and update the collected info accordingly.`
}
