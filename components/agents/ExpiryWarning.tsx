import { AlertCircle } from 'lucide-react'

interface ExpiryWarningProps {
  daysRemaining: number
  expiresAt: string
  itemType?: string
}

export function ExpiryWarning({ 
  daysRemaining, 
  expiresAt,
  itemType = 'item'
}: ExpiryWarningProps) {
  const isUrgent = daysRemaining <= 7

  return (
    <div className={`p-3 rounded-md border ${
      isUrgent ? 'bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/50' : 'bg-neutral-50 dark:bg-surface-container-high/60 border-neutral-200 dark:border-white/[0.09]'
    }`}>
      <div className="flex items-start gap-2">
        <AlertCircle className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${
          isUrgent ? 'text-red-400' : 'text-neutral-400 dark:text-neutral-500'
        }`} />
        <div>
          <p className={`text-xs font-medium ${
            isUrgent ? 'text-red-700 dark:text-red-400' : 'text-neutral-700 dark:text-neutral-300'
          }`}>
            {daysRemaining === 0
              ? 'Expires today'
              : daysRemaining === 1
              ? '1 day remaining'
              : `${daysRemaining} days remaining`}
          </p>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
            Permanent deletion on {new Date(expiresAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
