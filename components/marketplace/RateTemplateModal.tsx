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
              ? 'bg-neutral-600 dark:bg-neutral-400'
              : 'bg-neutral-200 dark:bg-surface-container-high'
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
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-surface-container rounded-xl border border-neutral-200 dark:border-white/[0.09] max-w-md w-full shadow-lg">
        {/* Header */}
        <div className="border-b border-neutral-100 dark:border-white/[0.09] px-5 py-3.5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Rate Template
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-surface-container-high rounded transition-colors"
          >
            <X className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {agentName}
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
              How would you rate this template?
            </p>
          </div>

          {/* Signal Bar Rating */}
          <div
            className="flex items-end justify-center gap-4 py-5"
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
                        ? 'bg-neutral-700'
                        : 'bg-neutral-200'
                    }`}
                  />
                </button>
              )
            })}
          </div>

          {rating > 0 && (
            <p className="text-center text-xs font-medium text-neutral-600 dark:text-neutral-300 -mt-2">
              {RATING_LABELS[rating]}
            </p>
          )}

          {/* Review */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Review (Optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-white dark:bg-surface-container-high border border-neutral-200 dark:border-white/[0.09] rounded-md focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 outline-none resize-none text-sm text-neutral-700 dark:text-neutral-300 placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
              placeholder="Share your experience with this template..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] text-neutral-600 dark:text-neutral-400 rounded-md text-sm font-medium hover:bg-neutral-50 dark:hover:bg-surface-container-high transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded-md text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
