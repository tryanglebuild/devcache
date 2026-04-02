'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Database, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface EmbeddingsStats {
  total_templates: number
  templates_with_embeddings: number
  templates_needing_embeddings: number
  last_indexed_at: string | null
}

export function EmbeddingsSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [stats, setStats] = useState<EmbeddingsStats | null>(null)

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/embeddings/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      toast.error('Failed to load embeddings stats')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleGenerateEmbeddings = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/embeddings/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 20 }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate embeddings')
      }

      const result = await response.json()
      
      if (result.indexed === 0) {
        toast.success('All templates already have embeddings!')
      } else {
        toast.success(`Generated embeddings for ${result.indexed} templates`)
      }
      
      await fetchStats()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate embeddings')
    } finally {
      setIsGenerating(false)
    }
  }

  const percentage = stats 
    ? Math.round((stats.templates_with_embeddings / stats.total_templates) * 100) || 0
    : 0

  return (
    <Card className="bg-white border-[#e5e7eb] shadow-sm">
      <CardHeader className="pb-6 border-b border-[#e5e7eb]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#10b981] flex items-center justify-center">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-[#191c1e]">
              Embeddings Management
            </CardTitle>
            <CardDescription className="text-[#6b7280] text-sm">
              Generate and manage vector embeddings for semantic search
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#4648d4]" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-white border border-[#e5e7eb] rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                    Total Templates
                  </span>
                  <Database className="h-4 w-4 text-[#4648d4]" />
                </div>
                <div className="text-3xl font-bold text-[#191c1e]">
                  {stats?.total_templates || 0}
                </div>
              </div>

              <div className="p-5 bg-white border border-[#e5e7eb] rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                    With Embeddings
                  </span>
                  <CheckCircle2 className="h-4 w-4 text-[#10b981]" />
                </div>
                <div className="text-3xl font-bold text-[#191c1e]">
                  {stats?.templates_with_embeddings || 0}
                </div>
              </div>

              <div className="p-5 bg-white border border-[#e5e7eb] rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                    Need Indexing
                  </span>
                  <AlertCircle className="h-4 w-4 text-[#f59e0b]" />
                </div>
                <div className="text-3xl font-bold text-[#191c1e]">
                  {stats?.templates_needing_embeddings || 0}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="p-5 bg-[#f7f9fb] border border-[#e5e7eb] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#191c1e]">
                  Indexing Progress
                </span>
                <span className="text-sm font-bold text-[#4648d4]">
                  {percentage}%
                </span>
              </div>
              <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-[#e5e7eb]">
                <div
                  className="h-full bg-gradient-to-r from-[#4648d4] to-[#6063ee] transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-xs text-[#6b7280] mt-2">
                {stats?.templates_with_embeddings || 0} of {stats?.total_templates || 0} templates indexed
              </p>
            </div>

            {/* Info Card */}
            <div className="p-5 bg-white border border-[#e5e7eb] rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-[#f7f9fb] border border-[#e5e7eb] flex items-center justify-center shrink-0">
                  <Database className="h-4 w-4 text-[#4648d4]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#191c1e] mb-1">
                    About Embeddings
                  </h4>
                  <p className="text-xs text-[#6b7280] leading-relaxed mb-3">
                    Embeddings enable semantic search across your templates. They convert text into 
                    numerical vectors that capture meaning, allowing you to find relevant templates 
                    based on concepts rather than just keywords.
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs text-[#6b7280]">
                      • Automatically generated for new templates
                    </p>
                    <p className="text-xs text-[#6b7280]">
                      • Updated when template content changes
                    </p>
                    <p className="text-xs text-[#6b7280]">
                      • Uses OpenAI's text-embedding-ada-002 model
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Last Indexed */}
            {stats?.last_indexed_at && (
              <div className="text-xs text-[#6b7280]">
                Last indexed: {new Date(stats.last_indexed_at).toLocaleString()}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-[#e5e7eb]">
              <Button
                onClick={handleGenerateEmbeddings}
                disabled={isGenerating || stats?.templates_needing_embeddings === 0}
                className="bg-[#4648d4] hover:bg-[#3739b8] text-white font-semibold shadow-sm hover:shadow-md transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate Embeddings
                  </>
                )}
              </Button>
              
              <Button
                onClick={fetchStats}
                variant="outline"
                disabled={isLoading}
                className="border-[#e5e7eb] hover:bg-[#f7f9fb]"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Stats
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
