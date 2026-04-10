'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

function SignalBars({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' | 'lg' }) {
  const heights = size === 'sm' ? [5, 7, 9, 11, 13] : size === 'lg' ? [10, 14, 18, 22, 26] : [6, 9, 12, 15, 18]
  const gap = 'gap-px'
  const width = size === 'lg' ? 'w-1.5' : 'w-1'
  return (
    <span className={`inline-flex items-end ${gap}`}>
      {heights.map((h, i) => (
        <span
          key={i}
          style={{ height: h }}
          className={`${width} rounded-sm transition-colors ${
            i < value
              ? 'bg-[#6366f1]/70 dark:bg-[#7c7ff5]/60'
              : 'bg-slate-200 dark:bg-slate-700'
          }`}
        />
      ))}
    </span>
  )
}

interface RateTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  agentId: string
  agentName: string
  currentRating?: number | null
  currentReview?: string | null
  onSuccess?: () => void
}

export function RateTemplateModal({
  isOpen,
  onClose,
  agentId,
  agentName,
  currentRating,
  currentReview,
  onSuccess
}: RateTemplateModalProps) {
  const [rating, setRating] = useState(currentRating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [review, setReview] = useState(currentReview || '')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/agents/${agentId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, review: review || null })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Rating submitted successfully!')
        onSuccess?.()
        onClose()
      } else {
        toast.error(data.error || 'Failed to submit rating')
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-surface-container rounded-2xl max-w-lg w-full">
        {/* Header */}
        <div className="border-b border-[#c7c4d7]/10 dark:border-white/[0.06] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#191c1e] dark:text-on-surface">
            Rate Template
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f2f4f6] dark:hover:bg-surface-container-high rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#464554] dark:text-on-surface-variant" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <p className="text-sm font-semibold text-[#191c1e] dark:text-on-surface mb-2">
              {agentName}
            </p>
            <p className="text-xs text-[#464554] dark:text-on-surface-variant">
              How would you rate this template?
            </p>
          </div>

          {/* Signal Bar Rating */}
          <div
            className="flex items-end justify-center gap-3 py-6"
            onMouseLeave={() => setHoveredRating(0)}
          >
            {[1, 2, 3, 4, 5].map((bar) => {
              const active = bar <= (hoveredRating || rating)
              const heights = [10, 14, 18, 22, 26]
              return (
                <button
                  key={bar}
                  type="button"
                  onClick={() => setRating(bar)}
                  onMouseEnter={() => setHoveredRating(bar)}
                  className="flex flex-col items-end justify-end transition-transform hover:scale-110"
                  style={{ height: 26 }}
                  title={RATING_LABELS[bar]}
                >
                  <span
                    style={{ height: heights[bar - 1] }}
                    className={`w-4 rounded-sm transition-colors ${
                      active
                        ? 'bg-[#6366f1]/80 dark:bg-[#7c7ff5]/70'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                </button>
              )
            })}
          </div>

          {rating > 0 && (
            <p className="text-center text-sm font-semibold text-[#191c1e] dark:text-on-surface -mt-2">
              {RATING_LABELS[rating]}
            </p>
          )}

          {/* Review */}
          <div>
            <label className="block text-sm font-bold text-[#191c1e] dark:text-on-surface mb-2">
              Review (Optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-white dark:bg-surface border border-[#c7c4d7]/20 dark:border-white/[0.09] rounded-lg focus:ring-2 focus:ring-[#4f46e5]/20 dark:focus:ring-[#7c7ff5]/20 focus:border-[#4f46e5] dark:focus:border-[#7c7ff5] outline-none resize-none"
              placeholder="Share your experience with this template..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-white dark:bg-surface border-2 border-[#c7c4d7]/20 dark:border-white/[0.09] text-[#464554] dark:text-on-surface-variant rounded-lg font-bold hover:bg-[#f2f4f6] dark:hover:bg-surface-container-high transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1 px-6 py-3 bg-[#4f46e5] text-white rounded-lg font-bold hover:bg-[#4338ca] transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
