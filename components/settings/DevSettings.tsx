'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { RefreshCw, Database, CheckCircle2, AlertCircle, Loader2, FileText, FolderOpen } from 'lucide-react'
import toast from 'react-hot-toast'

interface EmbeddingStats {
  total_agents: number
  agents_with_embeddings: number
  agents_pending: number
  total_project_items: number
  project_items_with_embeddings: number
  project_items_pending: number
  last_check: string
}

interface ProcessingItem {
  id: string
  name: string
  type: 'agent' | 'project'
  status: 'pending' | 'processing' | 'success' | 'error'
}

export function DevSettings() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [stats, setStats] = useState<EmbeddingStats | null>(null)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [processingItems, setProcessingItems] = useState<ProcessingItem[]>([])
  const [showProgress, setShowProgress] = useState(false)

  const analyzeEmbeddings = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/embeddings/stats')
      
      if (!response.ok) {
        throw new Error('Failed to fetch embedding stats')
      }

      const data = await response.json()
      setStats(data.stats)
      
      const totalPending = data.stats.project_items_pending + data.stats.agents_pending
      
      if (totalPending === 0) {
        toast.success('All embeddings are up to date!')
      } else {
        toast(`Found ${totalPending} item(s) pending embeddings`, {
          icon: '⚠️',
        })
      }
    } catch (error) {
      console.error('Error analyzing embeddings:', error)
      toast.error('Failed to analyze embeddings')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const syncEmbeddings = async () => {
    if (!stats) {
      toast.error('Please analyze first')
      return
    }

    const totalPending = stats.project_items_pending + stats.agents_pending

    if (totalPending === 0) {
      toast.success('No pending embeddings to sync')
      return
    }

    setIsSyncing(true)
    setShowProgress(true)
    
    // Get pending items first to show in progress
    try {
      const pendingResponse = await fetch('/api/embeddings/pending')
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json()
        const items: ProcessingItem[] = pendingData.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          type: item.type,
          status: 'pending' as const
        }))
        setProcessingItems(items)
      }
    } catch (error) {
      console.error('Error fetching pending items:', error)
    }

    const syncToast = toast.loading(`Syncing ${totalPending} embedding(s)...`)

    try {
      const response = await fetch('/api/embeddings/cron-trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ max_items: 100 }),
      })

      if (!response.ok) {
        throw new Error('Failed to trigger embedding sync')
      }

      const result = await response.json()
      
      // Mark all as success
      setProcessingItems(prev => 
        prev.map(item => ({ ...item, status: 'success' as const }))
      )
      
      toast.success(
        `Sync complete! Processed: ${result.result?.processed || 0}, Succeeded: ${result.result?.succeeded || 0}`,
        { id: syncToast }
      )
      
      setLastSync(new Date())
      
      // Refresh stats after sync
      setTimeout(() => {
        analyzeEmbeddings()
        // Hide progress after a delay
        setTimeout(() => setShowProgress(false), 2000)
      }, 1000)
    } catch (error) {
      console.error('Error syncing embeddings:', error)
      
      // Mark all as error
      setProcessingItems(prev => 
        prev.map(item => ({ ...item, status: 'error' as const }))
      )
      
      toast.error('Failed to sync embeddings', { id: syncToast })
    } finally {
      setIsSyncing(false)
    }
  }

  const totalPending = stats 
    ? stats.project_items_pending + stats.agents_pending 
    : 0

  const projectPercentage = stats && stats.total_project_items > 0
    ? Math.round((stats.project_items_with_embeddings / stats.total_project_items) * 100)
    : 0

  const agentPercentage = stats && stats.total_agents > 0
    ? Math.round((stats.agents_with_embeddings / stats.total_agents) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#191c1e] mb-2">Developer Tools</h2>
        <p className="text-[#464554]">
          Manage embeddings and system maintenance tasks
        </p>
      </div>

      {/* Embedding Sync Card */}
      <Card className="p-6 border-[#c7c4d7]/20 bg-gradient-to-br from-white to-[#f7f9fb]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4648d4] to-[#6063ee] flex items-center justify-center shrink-0">
            <Database className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#191c1e] mb-1">
              Embedding Sync
            </h3>
            <p className="text-sm text-[#464554] mb-4">
              Analyze and sync embeddings for your documentation files and agent templates
            </p>

            {/* Stats Display */}
            {stats && (
              <div className="mb-4 p-4 bg-white rounded-lg border border-[#c7c4d7]/20">
                <div className="grid grid-cols-2 gap-4">
                  {/* Project Files */}
                  <div>
                    <div className="text-xs font-medium text-[#464554] mb-2">
                      Project Files
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-2xl font-bold text-[#191c1e]">
                        {stats.project_items_with_embeddings}/{stats.total_project_items}
                      </div>
                      <div className="text-sm text-[#464554]">
                        ({projectPercentage}%)
                      </div>
                    </div>
                    {stats.project_items_pending > 0 ? (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <AlertCircle className="h-3 w-3" />
                        {stats.project_items_pending} pending
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <CheckCircle2 className="h-3 w-3" />
                        All synced
                      </div>
                    )}
                  </div>

                  {/* Agent Templates */}
                  <div>
                    <div className="text-xs font-medium text-[#464554] mb-2">
                      Agent Templates
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-2xl font-bold text-[#191c1e]">
                        {stats.agents_with_embeddings}/{stats.total_agents}
                      </div>
                      <div className="text-sm text-[#464554]">
                        ({agentPercentage}%)
                      </div>
                    </div>
                    {stats.agents_pending > 0 ? (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <AlertCircle className="h-3 w-3" />
                        {stats.agents_pending} pending
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <CheckCircle2 className="h-3 w-3" />
                        All synced
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {totalPending > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#c7c4d7]/20">
                    <div className="flex items-center justify-between text-xs text-[#464554] mb-2">
                      <span>Overall Progress</span>
                      <span className="font-medium">
                        {totalPending} item(s) pending
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#4648d4] to-[#6063ee] transition-all duration-500"
                        style={{ 
                          width: `${Math.round(((stats.project_items_with_embeddings + stats.agents_with_embeddings) / (stats.total_project_items + stats.total_agents)) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={analyzeEmbeddings}
                disabled={isAnalyzing || isSyncing}
                variant="outline"
                className="flex-1"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>

              <Button
                onClick={syncEmbeddings}
                disabled={!stats || totalPending === 0 || isAnalyzing || isSyncing}
                className="flex-1 bg-gradient-to-r from-[#4648d4] to-[#6063ee] hover:from-[#3537c3] hover:to-[#4f52dd] text-white"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Embeddings
                  </>
                )}
              </Button>
            </div>

            {lastSync && (
              <div className="mt-3 text-xs text-[#464554]">
                Last synced: {lastSync.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Progress Display */}
      {showProgress && processingItems.length > 0 && (
        <Card className="p-6 border-[#c7c4d7]/20 bg-white">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#191c1e]">
                Processing Items
              </h3>
              <div className="text-sm text-[#464554]">
                {processingItems.filter(i => i.status === 'success').length}/{processingItems.length}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {processingItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
                >
                  {/* Icon */}
                  <div className="shrink-0">
                    {item.type === 'agent' ? (
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Database className="h-4 w-4 text-gray-500" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#191c1e] truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-[#464554]">
                      {item.type === 'agent' ? 'Agent Template' : 'Project File'}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="shrink-0">
                    {item.status === 'pending' && (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    )}
                    {item.status === 'processing' && (
                      <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />
                    )}
                    {item.status === 'success' && (
                      <CheckCircle2 className="h-5 w-5 text-gray-500" />
                    )}
                    {item.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Info Card */}
      <Card className="p-4 border-[#c7c4d7]/20 bg-gray-50">
        <div className="flex gap-3">
          <div className="text-gray-500 shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="text-sm text-[#464554]">
            <p className="font-medium text-[#191c1e] mb-1">About Embeddings</p>
            <p>
              Embeddings enable AI-powered search across your documentation. 
              They are generated automatically when you push files via CLI, 
              but you can manually sync them here if needed.
            </p>
            <p className="mt-2">
              A weekly cron job runs every Sunday at 2 AM UTC to catch any missed items.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
