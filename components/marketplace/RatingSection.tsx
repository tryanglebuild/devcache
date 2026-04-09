'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { AgentRating } from '@/types/agents.types'
import toast from 'react-hot-toast'

interface RatingSectionProps {
  agentId: string
  ratings: (AgentRating & {
    profiles?: {
      full_name: string | null
      avatar_url: string | null
    }
  })[]
  userRating: number | null
  isAuthenticated: boolean
  isOwner: boolean
}

export function RatingSection({
  agentId,
  ratings,
  userRating,
  isAuthenticated,
  isOwner
}: RatingSectionProps) {
  const router = useRouter()
  const [selectedRating, setSelectedRating] = useState(userRating || 0)
  const [review, setReview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitRating = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to rate agents')
      router.push('/login')
      return
    }

    if (selectedRating === 0) {
      toast.error('Please select a rating')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/agents/${agentId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: selectedRating,
          review: review.trim() || null
        })
      })

      if (response.ok) {
        toast.success('Rating submitted successfully!')
        setReview('')
        router.refresh()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to submit rating')
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
      toast.error('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-surface-container rounded-xl p-8 shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/[0.08]">
      <h2 className="text-2xl font-bold text-[#191c1e] dark:text-on-surface mb-6">
        Ratings & Reviews
      </h2>

      {/* Rating Form */}
      {!isOwner && isAuthenticated && (
        <div className="mb-8 p-6 bg-[#f7f9fb] dark:bg-surface-container-low rounded-xl">
          <h3 className="font-bold text-[#191c1e] dark:text-on-surface mb-4">
            {userRating ? 'Update Your Rating' : 'Rate This Agent'}
          </h3>

          {/* Star Rating */}
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setSelectedRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= selectedRating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200 dark:text-slate-600'
                  }`}
                />
              </button>
            ))}
            {selectedRating > 0 && (
              <span className="ml-2 font-semibold text-[#191c1e] dark:text-on-surface">
                {selectedRating} / 5
              </span>
            )}
          </div>

          {/* Review Text */}
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience with this agent (optional)..."
            className="w-full px-4 py-3 bg-white dark:bg-surface border border-[#c7c4d7]/20 dark:border-white/[0.09] rounded-lg focus:ring-2 focus:ring-[#4f46e5]/20 dark:focus:ring-[#7c7ff5]/20 focus:border-[#4f46e5] dark:focus:border-[#7c7ff5] outline-none text-sm resize-none text-[#191c1e] dark:text-on-surface placeholder:text-gray-400 dark:placeholder:text-on-surface-variant/50"
            rows={4}
          />

          <button
            onClick={handleSubmitRating}
            disabled={isSubmitting || selectedRating === 0}
            className="mt-4 px-6 py-2.5 bg-[#4f46e5] dark:bg-[#7c7ff5] text-white dark:text-[#0d1121] rounded-lg font-bold hover:bg-[#4338ca] dark:hover:bg-[#6a6de0] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : userRating ? 'Update Rating' : 'Submit Rating'}
          </button>
        </div>
      )}

      {/* Reviews List */}
      {ratings.length > 0 ? (
        <div className="space-y-6">
          {ratings.map((rating) => (
            <div key={rating.id} className="pb-6 border-b border-[#c7c4d7]/10 dark:border-white/[0.06] last:border-0">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4f46e5] to-[#4338ca] flex items-center justify-center text-white font-bold flex-shrink-0">
                  {rating.profiles?.full_name?.charAt(0) || 'U'}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-[#191c1e] dark:text-on-surface">
                        {rating.profiles?.full_name || 'Anonymous'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= rating.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-200 dark:text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-[#464554] dark:text-on-surface-variant">
                          {new Date(rating.created_at!).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {rating.review && (
                    <p className="text-sm text-[#464554] dark:text-on-surface-variant mt-2">
                      {rating.review}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#f2f4f6] dark:bg-surface-container-high flex items-center justify-center">
            <Star className="w-6 h-6 text-[#464554] dark:text-on-surface-variant" />
          </div>
          <p className="text-sm text-[#464554] dark:text-on-surface-variant">
            No reviews yet. Be the first to rate this agent!
          </p>
        </div>
      )}
    </div>
  )
}
