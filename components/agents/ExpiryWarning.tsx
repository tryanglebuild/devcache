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
    <div className="p-4 rounded-lg border-2 bg-gray-50 border-gray-200">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 mt-0.5 text-gray-500" />
        <div className="flex-1">
          <p className="font-bold text-sm text-gray-700">
            {daysRemaining === 0 
              ? 'Expires today!' 
              : daysRemaining === 1
              ? '1 day remaining'
              : `${daysRemaining} days remaining`}
          </p>
          <p className="text-xs text-[#464554] mt-1">
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
