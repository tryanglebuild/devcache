'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Zap, TrendingUp, DollarSign } from 'lucide-react'
import { useSessionUsage } from '@/lib/hooks/useSessionUsage'
import { Skeleton } from '@/components/ui/skeleton'

interface TokenUsagePopoverProps {
  sessionId: string
  totalCredits: number
}

export function TokenUsagePopover({ sessionId, totalCredits }: TokenUsagePopoverProps) {
  const { usage, loading } = useSessionUsage(sessionId)

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-xs text-[#9ca3af] hover:text-[#4f46e5] transition-colors underline decoration-dotted">
          details
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-1">Token Usage</h4>
            <p className="text-xs text-muted-foreground">
              This conversation's token consumption
            </p>
          </div>

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : usage ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-3 w-3 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">Input</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {formatNumber(usage.totalTokensInput)}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-3 w-3 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">Output</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {formatNumber(usage.totalTokensOutput)}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Total Cost</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    ${usage.totalCost}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  Recent messages ({usage.messages.length})
                </p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {usage.messages.slice(-5).reverse().map((msg, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs p-2 rounded bg-muted/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{msg.model || 'Unknown'}</p>
                        <p className="text-muted-foreground text-[10px]">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatNumber(msg.tokensInput + msg.tokensOutput)}
                        </p>
                        <p className="text-muted-foreground text-[10px]">
                          ${msg.cost.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No usage data available
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
