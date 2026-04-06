// Token Usage Statistics API
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

// GET /api/chat/usage - Get user's token usage statistics
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (sessionId) {
      // Get usage for specific session
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('tokens_input, tokens_output, cost_usd, created_at, model_used')
        .eq('session_id', sessionId)
        .eq('role', 'assistant')
        .order('created_at', { ascending: true })

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch session usage' },
          { status: 500 }
        )
      }

      const totalTokensInput = messages?.reduce((sum, m) => sum + (m.tokens_input || 0), 0) || 0
      const totalTokensOutput = messages?.reduce((sum, m) => sum + (m.tokens_output || 0), 0) || 0
      const totalCost = messages?.reduce((sum, m) => sum + (parseFloat(m.cost_usd as any) || 0), 0) || 0

      return NextResponse.json({
        sessionId,
        totalTokensInput,
        totalTokensOutput,
        totalTokens: totalTokensInput + totalTokensOutput,
        totalCost: totalCost.toFixed(6),
        messages: messages?.map(m => ({
          tokensInput: m.tokens_input || 0,
          tokensOutput: m.tokens_output || 0,
          cost: parseFloat(m.cost_usd as any) || 0,
          createdAt: m.created_at,
          model: m.model_used,
        })) || [],
      })
    }

    // Get overall usage statistics
    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('user_id', user.id)

    if (sessionsError) {
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      )
    }

    const sessionIds = sessions?.map(s => s.id) || []

    if (sessionIds.length === 0) {
      return NextResponse.json({
        totalTokensInput: 0,
        totalTokensOutput: 0,
        totalTokens: 0,
        totalCost: '0.000000',
        totalSessions: 0,
        totalMessages: 0,
        byModel: {},
        last30Days: [],
      })
    }

    // Get all messages for user's sessions
    const { data: allMessages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('tokens_input, tokens_output, cost_usd, created_at, model_used, session_id')
      .in('session_id', sessionIds)
      .eq('role', 'assistant')
      .order('created_at', { ascending: true })

    if (messagesError) {
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    const totalTokensInput = allMessages?.reduce((sum, m) => sum + (m.tokens_input || 0), 0) || 0
    const totalTokensOutput = allMessages?.reduce((sum, m) => sum + (m.tokens_output || 0), 0) || 0
    const totalCost = allMessages?.reduce((sum, m) => sum + (parseFloat(m.cost_usd as any) || 0), 0) || 0

    // Group by model
    const byModel: Record<string, any> = {}
    allMessages?.forEach(m => {
      const model = m.model_used || 'unknown'
      if (!byModel[model]) {
        byModel[model] = {
          tokensInput: 0,
          tokensOutput: 0,
          totalTokens: 0,
          cost: 0,
          messageCount: 0,
        }
      }
      byModel[model].tokensInput += m.tokens_input || 0
      byModel[model].tokensOutput += m.tokens_output || 0
      byModel[model].totalTokens += (m.tokens_input || 0) + (m.tokens_output || 0)
      byModel[model].cost += parseFloat(m.cost_usd as any) || 0
      byModel[model].messageCount += 1
    })

    // Group by day for last 30 days
    const last30Days: any[] = []
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const dailyUsage: Record<string, any> = {}
    allMessages?.forEach(m => {
      const date = new Date(m.created_at!)
      if (date >= thirtyDaysAgo) {
        const dateKey = date.toISOString().split('T')[0]
        if (!dailyUsage[dateKey]) {
          dailyUsage[dateKey] = {
            date: dateKey,
            tokensInput: 0,
            tokensOutput: 0,
            totalTokens: 0,
            cost: 0,
            messageCount: 0,
          }
        }
        dailyUsage[dateKey].tokensInput += m.tokens_input || 0
        dailyUsage[dateKey].tokensOutput += m.tokens_output || 0
        dailyUsage[dateKey].totalTokens += (m.tokens_input || 0) + (m.tokens_output || 0)
        dailyUsage[dateKey].cost += parseFloat(m.cost_usd as any) || 0
        dailyUsage[dateKey].messageCount += 1
      }
    })

    Object.keys(dailyUsage).sort().forEach(date => {
      last30Days.push(dailyUsage[date])
    })

    return NextResponse.json({
      totalTokensInput,
      totalTokensOutput,
      totalTokens: totalTokensInput + totalTokensOutput,
      totalCost: totalCost.toFixed(6),
      totalSessions: sessionIds.length,
      totalMessages: allMessages?.length || 0,
      byModel,
      last30Days,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
