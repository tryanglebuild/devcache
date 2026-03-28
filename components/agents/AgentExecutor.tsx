'use client'

import { useState } from 'react'
import { Play, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'
import type { AgentTemplateWithStats } from '@/types/agents.types'
import { parseAgentTemplate } from '@/lib/agents/executor'
import toast from 'react-hot-toast'

interface AgentExecutorProps {
  agent: AgentTemplateWithStats
  onExecutionComplete?: (result: any) => void
}

export function AgentExecutor({ agent, onExecutionComplete }: AgentExecutorProps) {
  const [isExecuting, setIsExecuting] = useState(false)
  const [parameters, setParameters] = useState<Record<string, any>>({})
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [executionTime, setExecutionTime] = useState<number | null>(null)

  // Parse agent to extract parameters
  const parsedAgent = parseAgentTemplate(agent.content)

  const handleParameterChange = (name: string, value: any) => {
    setParameters(prev => ({ ...prev, [name]: value }))
  }

  const handleExecute = async () => {
    setIsExecuting(true)
    setError(null)
    setResult(null)
    setExecutionTime(null)

    try {
      const response = await fetch(`/api/agents/${agent.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parameters })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data.output)
        setExecutionTime(data.execution_time_ms)
        toast.success('Agent executed successfully!')
        onExecutionComplete?.(data)
      } else {
        setError(data.error || 'Execution failed')
        toast.error(data.error || 'Execution failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsExecuting(false)
    }
  }

  const renderParameterInput = (param: any) => {
    const value = parameters[param.name] || ''

    switch (param.type) {
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleParameterChange(param.name, parseFloat(e.target.value))}
            className="w-full px-4 py-2.5 bg-white border border-[#c7c4d7]/20 rounded-lg focus:ring-2 focus:ring-[#4648d4]/20 focus:border-[#4648d4] outline-none text-sm"
            placeholder={`Enter ${param.name}`}
          />
        )

      case 'boolean':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleParameterChange(param.name, e.target.checked)}
              className="w-5 h-5 text-[#4648d4] border-[#c7c4d7]/30 rounded focus:ring-2 focus:ring-[#4648d4]/20"
            />
            <span className="text-sm text-[#464554]">
              {value ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        )

      case 'array':
        return (
          <textarea
            value={Array.isArray(value) ? value.join('\n') : value}
            onChange={(e) => handleParameterChange(param.name, e.target.value.split('\n').filter(Boolean))}
            className="w-full px-4 py-2.5 bg-white border border-[#c7c4d7]/20 rounded-lg focus:ring-2 focus:ring-[#4648d4]/20 focus:border-[#4648d4] outline-none text-sm resize-none"
            rows={4}
            placeholder="Enter one item per line"
          />
        )

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#c7c4d7]/20 rounded-lg focus:ring-2 focus:ring-[#4648d4]/20 focus:border-[#4648d4] outline-none text-sm"
            placeholder={`Enter ${param.name}`}
          />
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Parameters Form */}
      {parsedAgent.parameters.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#191c1e] mb-4">
            Parameters
          </h3>
          <div className="space-y-4">
            {parsedAgent.parameters.map((param) => (
              <div key={param.name}>
                <label className="block text-sm font-semibold text-[#191c1e] mb-2">
                  {param.name}
                  {param.required && (
                    <span className="text-[#ba1a1a] ml-1">*</span>
                  )}
                  <span className="ml-2 text-xs font-normal text-[#464554]">
                    ({param.type})
                  </span>
                </label>
                {renderParameterInput(param)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execute Button */}
      <button
        onClick={handleExecute}
        disabled={isExecuting}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-br from-[#10b981] to-[#059669] text-white rounded-xl font-bold shadow-lg shadow-[#10b981]/20 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExecuting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Executing Agent...
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            Execute Agent
          </>
        )}
      </button>

      {/* Execution Time */}
      {executionTime !== null && (
        <div className="flex items-center justify-center gap-2 text-sm text-[#464554]">
          <Clock className="w-4 h-4" />
          <span>Executed in {executionTime}ms</span>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-[#10b981]" />
            <h3 className="text-lg font-bold text-[#191c1e]">
              Execution Result
            </h3>
          </div>
          <div className="bg-[#f7f9fb] rounded-lg p-4">
            <pre className="text-sm text-[#191c1e] whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-[#ba1a1a]/20">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-[#ba1a1a]" />
            <h3 className="text-lg font-bold text-[#ba1a1a]">
              Execution Failed
            </h3>
          </div>
          <p className="text-sm text-[#464554]">{error}</p>
        </div>
      )}
    </div>
  )
}
