// Chat API client utilities

import type {
  ChatSession,
  ChatMessage,
  ModelConfig,
  UserModelPreferences,
  CreateSessionRequest,
  UpdateSessionRequest,
  SendMessageRequest,
  UpdatePreferencesRequest,
  ApiResponse,
} from '@/types/chat'

const API_BASE = '/api/chat'

// Sessions
export async function getSessions(): Promise<ChatSession[]> {
  const res = await fetch(`${API_BASE}/sessions`)
  const data: ApiResponse<ChatSession[]> = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to fetch sessions')
  return data.data || []
}

export async function getSession(id: string): Promise<ChatSession> {
  const res = await fetch(`${API_BASE}/sessions/${id}`)
  const data: ApiResponse<ChatSession> = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to fetch session')
  if (!data.data) throw new Error('Session not found')
  return data.data
}

export async function createSession(request: CreateSessionRequest): Promise<ChatSession> {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  const data: ApiResponse<ChatSession> = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to create session')
  if (!data.data) throw new Error('No session returned')
  return data.data
}

export async function updateSession(id: string, request: UpdateSessionRequest): Promise<ChatSession> {
  const res = await fetch(`${API_BASE}/sessions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  const data: ApiResponse<ChatSession> = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to update session')
  if (!data.data) throw new Error('No session returned')
  return data.data
}

export async function deleteSession(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/sessions/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const data: ApiResponse<never> = await res.json()
    throw new Error(data.error || 'Failed to delete session')
  }
}

// Messages
export async function getMessages(sessionId: string): Promise<ChatMessage[]> {
  const res = await fetch(`${API_BASE}/messages?sessionId=${sessionId}`)
  const data: ApiResponse<ChatMessage[]> = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to fetch messages')
  return data.data || []
}

export async function* sendMessage(request: SendMessageRequest): AsyncGenerator<string> {
  const res = await fetch(`${API_BASE}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!res.ok) {
    const data: ApiResponse<never> = await res.json()
    throw new Error(data.error || 'Failed to send message')
  }

  const reader = res.body?.getReader()
  const decoder = new TextDecoder()

  if (!reader) throw new Error('No response body')

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter(line => line.trim() !== '')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') return

          try {
            const parsed = JSON.parse(data)
            if (parsed.content) yield parsed.content
          } catch (e) {
            console.error('Error parsing SSE:', e)
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

// Models
export async function getModels(): Promise<ModelConfig[]> {
  const res = await fetch(`${API_BASE}/models`)
  const data: ApiResponse<ModelConfig[]> = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to fetch models')
  return data.data || []
}

// Preferences
export async function getPreferences(): Promise<UserModelPreferences> {
  const res = await fetch(`${API_BASE}/preferences`)
  const data: ApiResponse<UserModelPreferences> = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to fetch preferences')
  if (!data.data) throw new Error('No preferences found')
  return data.data
}

export async function updatePreferences(request: UpdatePreferencesRequest): Promise<UserModelPreferences> {
  const res = await fetch(`${API_BASE}/preferences`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  const data: ApiResponse<UserModelPreferences> = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to update preferences')
  if (!data.data) throw new Error('No preferences returned')
  return data.data
}
