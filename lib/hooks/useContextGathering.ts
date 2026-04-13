// Hook for managing progressive context gathering state.
// The chat_context_state table and related RPCs were removed.
// This hook now returns a static never-gathering state so the UI
// continues to compile and render without any database calls.
'use client'

export interface ContextState {
  isGathering: boolean
  collectedInfo: Record<string, unknown>
  questionsAsked: string[]
  questionsAnswered: number
  progress: number // 0-100
  confidenceScore: number
  needsResource: boolean
}

const IDLE_STATE: ContextState = {
  isGathering: false,
  collectedInfo: {},
  questionsAsked: [],
  questionsAnswered: 0,
  progress: 0,
  confidenceScore: 0,
  needsResource: false,
}

export function useContextGathering(_sessionId: string) {
  return {
    contextState: IDLE_STATE,
    loading: false,
    resetContext: () => {},
    refresh: () => {},
  }
}
