'use client'

import { useState, useEffect } from 'react'
import { Clock, CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Execution {
  id: string
  agent_id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  input_context: any
  output_result: any
  error_message: string | null
  execution_time_ms: number | null
  created_at: string
  completed_at: string | null
  agent_templates?: {
    id: string
    name: string
    category: string
    version: string
  }
}

interface ExecutionHistoryProps {
  agentId?: string
  limit?: number
}

export function ExecutionHistory({ agentId, limit = 10 }: ExecutionHistoryProps) {
  const [executions, setExecutions] = useState<Execution[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchExecutions()
  }, [agentId])

  const fetchExecutions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (agentId) params.set('agent_id', agentId)
      params.set('limit', limit.toString())

      const response = await fetch(`/api/agents/executions?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setExecutions(data.executions)
      }
    } catch (error) {
      console.error('Error fetching executions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: Execution['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-gray-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-gray-500" />
      case 'running':
        return <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
      default:
        return <Clock className="w-5 h-5 text-[#464554]" />
    }
  }

  const getStatusColor = (status: Execution['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-gray-100 text-gray-600'
      case 'failed':
        return 'bg-gray-100 text-gray-600'
      case 'running':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-[#464554]/10 text-[#464554]'
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#f2f4f6]" />
              <div className="flex-1">
                <div className="h-4 bg-[#f2f4f6] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[#f2f4f6] rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (executions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center shadow-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f2f4f6] flex items-center justify-center">
          <Clock className="w-8 h-8 text-[#464554]" />
        </div>
        <p className="text-[#464554] font-medium mb-2">No executions yet</p>
        <p className="text-sm text-[#464554]">
          Execute an agent to see the history here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {executions.map((execution) => (
        <div
          key={execution.id}
          className="bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md"
        >
          <div className="p-4">
            <div className="flex items-start gap-4">
              {/* Status Icon */}
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(execution.status)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h4 className="font-semibold text-[#191c1e] mb-1">
                      {execution.agent_templates?.name || 'Unknown Agent'}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-[#464554]">
                      <span
                        className={`px-2 py-1 rounded-full font-bold uppercase ${getStatusColor(
                          execution.status
                        )}`}
                      >
                        {execution.status}
                      </span>
                      <span>
                        {formatDistanceToNow(new Date(execution.created_at), {
                          addSuffix: true
                        })}
                      </span>
                      {execution.execution_time_ms && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {execution.execution_time_ms}ms
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expand Button */}
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === execution.id ? null : execution.id)
                    }
                    className="p-1 hover:bg-[#f2f4f6] rounded-lg transition-colors"
                  >
                    {expandedId === execution.id ? (
                      <ChevronUp className="w-5 h-5 text-[#464554]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#464554]" />
                    )}
                  </button>
                </div>

                {/* Error Message */}
                {execution.status === 'failed' && execution.error_message && (
                  <div className="mt-2 p-3 bg-[#ba1a1a]/5 rounded-lg">
                    <p className="text-sm text-[#ba1a1a]">
                      {execution.error_message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {expandedId === execution.id && (
            <div className="border-t border-[#c7c4d7]/10 p-4 bg-[#f7f9fb]">
              <div className="space-y-4">
                {/* Input Parameters */}
                {execution.input_context?.parameters && (
                  <div>
                    <h5 className="text-xs font-bold text-[#464554] uppercase tracking-wider mb-2">
                      Input Parameters
                    </h5>
                    <div className="bg-white rounded-lg p-3">
                      <pre className="text-xs text-[#191c1e] whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(execution.input_context.parameters, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Output Result */}
                {execution.status === 'completed' && execution.output_result && (
                  <div>
                    <h5 className="text-xs font-bold text-[#464554] uppercase tracking-wider mb-2">
                      Output Result
                    </h5>
                    <div className="bg-white rounded-lg p-3">
                      <pre className="text-xs text-[#191c1e] whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(execution.output_result, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
