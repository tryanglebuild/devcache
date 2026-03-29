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
    <div className={`p-4 rounded-lg border-2 ${
      isUrgent
        ? 'bg-red-50 border-red-200' 
        : 'bg-amber-50 border-amber-200'
    }`}>
      <div className="flex items-start gap-3">
        <AlertCircle className={`h-5 w-5 mt-0.5 ${
          isUrgent ? 'text-red-600' : 'text-amber-600'
        }`} />
        <div className="flex-1">
          <p className={`font-bold text-sm ${
            isUrgent ? 'text-red-700' : 'text-amber-700'
          }`}>
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
