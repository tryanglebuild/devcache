import { Calendar, Clock, AlertCircle } from 'lucide-react'

interface TemplateMetadataProps {
  createdAt: string
  deletedAt?: string
  expiresAt?: string
}

export function TemplateMetadata({ createdAt, deletedAt, expiresAt }: TemplateMetadataProps) {
  return (
    <div className="border border-neutral-200 dark:border-white/[0.09] rounded-md bg-white dark:bg-surface-container">
      <p className="px-4 py-2.5 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide border-b border-neutral-100 dark:border-white/[0.09]">
        Metadata
      </p>
      <div className="px-4 py-3 space-y-2.5">
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
          <span className="text-neutral-400 dark:text-neutral-500 w-14">Created</span>
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            {new Date(createdAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </span>
        </div>

        {deletedAt && (
          <div className="flex items-center gap-2 text-xs">
            <Clock className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
            <span className="text-neutral-400 dark:text-neutral-500 w-14">Deleted</span>
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {new Date(deletedAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </span>
          </div>
        )}

        {expiresAt && (
          <div className="flex items-center gap-2 text-xs">
            <AlertCircle className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
            <span className="text-neutral-400 dark:text-neutral-500 w-14">Expires</span>
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {new Date(expiresAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
