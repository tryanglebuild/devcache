'use client'

import { useState, useEffect } from 'react'

interface SessionUsage {
  sessionId: string
  totalTokensInput: number
  totalTokensOutput: number
  totalTokens: number
  totalCost: string
  messages: Array<{
    tokensInput: number
    tokensOutput: number
    cost: number
    createdAt: string
    model: string
  }>
}

export function useSessionUsage(sessionId: string | null) {
  const [usage, setUsage] = useState<SessionUsage | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setUsage(null)
      return
    }

    fetchUsage()
  }, [sessionId])

  async function fetchUsage() {
    if (!sessionId) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/chat/usage?sessionId=${sessionId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch usage')
      }

      const data = await response.json()
      setUsage(data)
    } catch (err) {
      console.error('Error fetching session usage:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return { usage, loading, error, refresh: fetchUsage }
}
