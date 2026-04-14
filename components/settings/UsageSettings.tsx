'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Activity, DollarSign, MessageSquare, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

interface UsageStats {
  totalTokensInput: number
  totalTokensOutput: number
  totalTokens: number
  totalCost: string
  totalSessions: number
  totalMessages: number
  byModel: Record<string, {
    tokensInput: number
    tokensOutput: number
    totalTokens: number
    cost: number
    messageCount: number
  }>
  last30Days: Array<{
    date: string
    tokensInput: number
    tokensOutput: number
    totalTokens: number
    cost: number
    messageCount: number
  }>
}

export function UsageSettings() {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsageStats()
  }, [])

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/chat/usage')
      if (!response.ok) {
        throw new Error('Failed to fetch usage stats')
      }
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching usage stats:', error)
      toast.error('Failed to load usage statistics')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No usage data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-surface-container border-gray-200 dark:border-white/[0.09]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-on-surface-variant">Total Tokens</CardTitle>
              <Zap className="h-4 w-4 text-gray-500 dark:text-on-surface-variant" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-on-surface">{formatNumber(stats.totalTokens)}</div>
            <p className="text-xs text-gray-500 dark:text-on-surface-variant mt-1">
              {formatNumber(stats.totalTokensInput)} in / {formatNumber(stats.totalTokensOutput)} out
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-surface-container border-gray-200 dark:border-white/[0.09]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-on-surface-variant">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500 dark:text-on-surface-variant" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-on-surface">${stats.totalCost}</div>
            <p className="text-xs text-gray-500 dark:text-on-surface-variant mt-1">USD</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-surface-container border-gray-200 dark:border-white/[0.09]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-on-surface-variant">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-gray-500 dark:text-on-surface-variant" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-on-surface">{formatNumber(stats.totalMessages)}</div>
            <p className="text-xs text-gray-500 dark:text-on-surface-variant mt-1">AI responses</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-surface-container border-gray-200 dark:border-white/[0.09]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-on-surface-variant">Sessions</CardTitle>
              <Activity className="h-4 w-4 text-gray-500 dark:text-on-surface-variant" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-on-surface">{formatNumber(stats.totalSessions)}</div>
            <p className="text-xs text-gray-500 dark:text-on-surface-variant mt-1">Conversations</p>
          </CardContent>
        </Card>
      </div>

      {/* Usage by Model */}
      <Card>
        <CardHeader>
          <CardTitle>Usage by Model</CardTitle>
          <CardDescription>Token consumption breakdown by AI model</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(stats.byModel).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No model usage data yet</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(stats.byModel)
                .sort((a, b) => b[1].totalTokens - a[1].totalTokens)
                .map(([model, data]) => (
                  <div key={model} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{model}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatNumber(data.messageCount)} messages
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatNumber(data.totalTokens)} tokens</p>
                      <p className="text-xs text-muted-foreground">${data.cost.toFixed(6)}</p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last 30 Days */}
      <Card>
        <CardHeader>
          <CardTitle>Last 30 Days</CardTitle>
          <CardDescription>Daily token usage and costs</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.last30Days.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No usage in the last 30 days</p>
          ) : (
            <div className="space-y-2">
              {stats.last30Days.slice(-10).reverse().map((day) => (
                <div key={day.date} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">{day.messageCount} messages</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatNumber(day.totalTokens)} tokens</p>
                    <p className="text-xs text-muted-foreground">${day.cost.toFixed(6)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
