import { Calendar, Clock, AlertCircle } from 'lucide-react'

interface TemplateMetadataProps {
  createdAt: string
  deletedAt?: string
  expiresAt?: string
}

export function TemplateMetadata({ createdAt, deletedAt, expiresAt }: TemplateMetadataProps) {
  return (
    <div className="bg-gradient-to-br from-[#4f46e5]/5 to-[#4f46e5]/10 p-6 rounded-xl border-2 border-[#4f46e5]/20">
      <h2 className="text-lg font-bold text-[#191c1e] mb-4">Template Metadata</h2>
      <div className="bg-white p-4 rounded-lg space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-[#464554]" />
          <span className="text-[#464554]">Created:</span>
          <span className="font-semibold text-[#191c1e]">
            {new Date(createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
        
        {deletedAt && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-[#464554]" />
            <span className="text-[#464554]">Deleted:</span>
            <span className="font-semibold text-[#191c1e]">
              {new Date(deletedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        )}
        
        {expiresAt && (
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-gray-500" />
            <span className="text-[#464554]">Expires:</span>
            <span className="font-semibold text-gray-700">
              {new Date(expiresAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
