// Hook for managing progressive context gathering state
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface ContextState {
  isGathering: boolean
  collectedInfo: Record<string, any>
  questionsAsked: string[]
  questionsAnswered: number
  progress: number // 0-100
  confidenceScore: number
  needsResource: boolean
}

export function useContextGathering(sessionId: string) {
  const [contextState, setContextState] = useState<ContextState>({
    isGathering: false,
    collectedInfo: {},
    questionsAsked: [],
    questionsAnswered: 0,
    progress: 0,
    confidenceScore: 0,
    needsResource: false,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }

    fetchContextState()

    // Poll for updates every 2 seconds while gathering
    const interval = setInterval(() => {
      if (contextState.isGathering) {
        fetchContextState()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [sessionId])

  async function fetchContextState() {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .rpc('get_or_create_context_state', {
          p_session_id: sessionId,
        })

      if (error) {
        console.error('Error fetching context state:', error)
        setLoading(false)
        return
      }

      if (data && data.length > 0) {
        const state = data[0]
        
        // Check if context gathering is active (not completed)
        const isActive = state.needs_resource && !state.context_completed_at

        setContextState({
          isGathering: isActive,
          collectedInfo: state.collected_info || {},
          questionsAsked: state.questions_asked || [],
          questionsAnswered: state.questions_answered || 0,
          progress: calculateProgress(state),
          confidenceScore: state.confidence_score || 0,
          needsResource: state.needs_resource || false,
        })
      } else {
        // No active context gathering
        setContextState({
          isGathering: false,
          collectedInfo: {},
          questionsAsked: [],
          questionsAnswered: 0,
          progress: 0,
          confidenceScore: 0,
          needsResource: false,
        })
      }

      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch context state:', error)
      setLoading(false)
    }
  }

  function calculateProgress(state: any): number {
    // Calculate progress based on collected info fields
    const requiredFields = ['resource_type', 'technology', 'purpose']
    const optionalFields = ['complexity', 'features']
    
    const collectedInfo = state.collected_info || {}
    const collectedRequired = requiredFields.filter(field => collectedInfo[field]).length
    const collectedOptional = optionalFields.filter(field => collectedInfo[field]).length
    
    // Required fields are worth 60%, optional 40%
    const requiredProgress = (collectedRequired / requiredFields.length) * 60
    const optionalProgress = (collectedOptional / optionalFields.length) * 40
    
    return Math.min(Math.round(requiredProgress + optionalProgress), 100)
  }

  async function resetContext() {
    try {
      const supabase = createClient()
      
      await supabase.rpc('complete_context_gathering', {
        p_session_id: sessionId,
      })

      setContextState({
        isGathering: false,
        collectedInfo: {},
        questionsAsked: [],
        questionsAnswered: 0,
        progress: 0,
        confidenceScore: 0,
        needsResource: false,
      })
    } catch (error) {
      console.error('Failed to reset context:', error)
    }
  }

  return {
    contextState,
    loading,
    resetContext,
    refresh: fetchContextState,
  }
}
