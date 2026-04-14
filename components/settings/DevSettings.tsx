'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { RefreshCw, Database, CheckCircle2, AlertCircle, Loader2, FolderOpen } from 'lucide-react'
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
    <div className="space-y-5">
      {/* Embedding Sync Card */}
      <Card className="p-5 border-neutral-200 dark:border-white/[0.09] bg-white dark:bg-surface-container shadow-none">
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-md bg-neutral-100 dark:bg-surface-container-high flex items-center justify-center shrink-0">
            <Database className="h-4 w-4 text-neutral-500 dark:text-on-surface-variant" />
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-on-surface mb-0.5">
              Embedding Sync
            </h3>
            <p className="text-xs text-neutral-500 dark:text-on-surface-variant mb-4">
              Analyze and sync embeddings for your documentation files and agent templates
            </p>

            {/* Stats Display */}
            {stats && (
              <div className="mb-4 p-4 bg-neutral-50 dark:bg-surface-container-high rounded-md border border-neutral-200 dark:border-white/[0.09]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-neutral-500 dark:text-on-surface-variant mb-1.5">Project Files</p>
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-lg font-semibold text-neutral-900 dark:text-on-surface">
                        {stats.project_items_with_embeddings}/{stats.total_project_items}
                      </span>
                      <span className="text-xs text-neutral-400 dark:text-on-surface-variant/60">({projectPercentage}%)</span>
                    </div>
                    {stats.project_items_pending > 0 ? (
                      <div className="flex items-center gap-1 text-xs text-neutral-400 dark:text-on-surface-variant/60">
                        <AlertCircle className="h-3 w-3" />
                        {stats.project_items_pending} pending
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-neutral-400 dark:text-on-surface-variant/60">
                        <CheckCircle2 className="h-3 w-3" />
                        All synced
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-medium text-neutral-500 dark:text-on-surface-variant mb-1.5">Agent Templates</p>
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-lg font-semibold text-neutral-900 dark:text-on-surface">
                        {stats.agents_with_embeddings}/{stats.total_agents}
                      </span>
                      <span className="text-xs text-neutral-400 dark:text-on-surface-variant/60">({agentPercentage}%)</span>
                    </div>
                    {stats.agents_pending > 0 ? (
                      <div className="flex items-center gap-1 text-xs text-neutral-400 dark:text-on-surface-variant/60">
                        <AlertCircle className="h-3 w-3" />
                        {stats.agents_pending} pending
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-neutral-400 dark:text-on-surface-variant/60">
                        <CheckCircle2 className="h-3 w-3" />
                        All synced
                      </div>
                    )}
                  </div>
                </div>

                {totalPending > 0 && (
                  <div className="mt-4 pt-3 border-t border-neutral-200">
                    <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-on-surface-variant mb-1.5">
                      <span>Overall Progress</span>
                      <span>{totalPending} pending</span>
                    </div>
                    <div className="h-1.5 bg-neutral-200 dark:bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neutral-500 transition-all duration-500"
                        style={{
                          width: `${Math.round(((stats.project_items_with_embeddings + stats.agents_with_embeddings) / (stats.total_project_items + stats.total_agents)) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={analyzeEmbeddings}
                disabled={isAnalyzing || isSyncing}
                variant="outline"
                size="sm"
              >
                {isAnalyzing ? (
                  <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />Analyzing...</>
                ) : (
                  <><Database className="h-3.5 w-3.5 mr-2" />Analyze</>
                )}
              </Button>

              <Button
                onClick={syncEmbeddings}
                disabled={!stats || totalPending === 0 || isAnalyzing || isSyncing}
                size="sm"
                className="bg-neutral-900 hover:bg-neutral-700 text-white"
              >
                {isSyncing ? (
                  <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />Syncing...</>
                ) : (
                  <><RefreshCw className="h-3.5 w-3.5 mr-2" />Sync Embeddings</>
                )}
              </Button>
            </div>

            {lastSync && (
              <p className="mt-2.5 text-xs text-neutral-400 dark:text-on-surface-variant/60">
                Last synced: {lastSync.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Progress Display */}
      {showProgress && processingItems.length > 0 && (
        <Card className="p-5 border-neutral-200 dark:border-white/[0.09] bg-white dark:bg-surface-container shadow-none">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-neutral-900 dark:text-on-surface">Processing Items</p>
              <span className="text-xs text-neutral-400 dark:text-on-surface-variant/60">
                {processingItems.filter(i => i.status === 'success').length}/{processingItems.length}
              </span>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-1">
              {processingItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-md bg-neutral-50 dark:bg-surface-container-high border border-neutral-100 dark:border-white/[0.06]"
                >
                  <div className="shrink-0">
                    {item.type === 'agent' ? (
                      <Database className="h-3.5 w-3.5 text-neutral-400 dark:text-on-surface-variant" />
                    ) : (
                      <FolderOpen className="h-3.5 w-3.5 text-neutral-400 dark:text-on-surface-variant" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-neutral-700 dark:text-on-surface-variant truncate">{item.name}</p>
                    <p className="text-[10px] text-neutral-400 dark:text-on-surface-variant/60">{item.type === 'agent' ? 'Agent' : 'Project File'}</p>
                  </div>
                  <div className="shrink-0">
                    {item.status === 'pending' && <div className="w-3.5 h-3.5 rounded-full border border-neutral-300 dark:border-white/[0.20]" />}
                    {item.status === 'processing' && <Loader2 className="h-3.5 w-3.5 text-neutral-400 dark:text-on-surface-variant animate-spin" />}
                    {item.status === 'success' && <CheckCircle2 className="h-3.5 w-3.5 text-neutral-500 dark:text-on-surface-variant" />}
                    {item.status === 'error' && <AlertCircle className="h-3.5 w-3.5 text-red-400" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Info */}
      <div className="p-4 bg-neutral-50 dark:bg-surface-container-high border border-neutral-200 dark:border-white/[0.09] rounded-md">
        <p className="text-xs text-neutral-500 dark:text-on-surface-variant leading-relaxed">
          <span className="font-medium text-neutral-700 dark:text-on-surface">About Embeddings — </span>
          Embeddings enable AI-powered search across your documentation. They are generated automatically when you push files via CLI,
          but you can manually sync them here if needed. A weekly cron job runs every Sunday at 2 AM UTC to catch any missed items.
        </p>
      </div>
    </div>
  )
}
