'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { trackAgentActivity } from '@/lib/activity/track'
import { Download, ArrowLeft, Heart, Share2, Code, Eye, Copy, Check, FileText, Trash2, Lock, Globe, Bookmark, BookmarkCheck } from 'lucide-react'
import type { AgentTemplateWithStats, AgentRating } from '@/types/agents.types'
import { AGENT_CATEGORIES } from '@/types/agents.types'
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from '@/lib/agents/category-icons'
import { RateTemplateModal } from './RateTemplateModal'
import toast from 'react-hot-toast'
import { Store } from 'lucide-react'

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
          className={`${width} rounded-sm ${
            i < Math.round(value)
              ? 'bg-neutral-500 dark:bg-neutral-400'
              : 'bg-neutral-200 dark:bg-neutral-700'
          }`}
        />
      ))}
    </span>
  )
}
import ReactMarkdown from 'react-markdown'
import { MarkdownCodeBlock } from '@/components/projects/MarkdownCodeBlock'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface AgentDetailClientProps {
  agent: AgentTemplateWithStats & {
    profiles?: {
      full_name: string | null
      avatar_url: string | null
      bio: string | null
    }
  }
  ratings: (AgentRating & {
    profiles?: {
      full_name: string | null
      avatar_url: string | null
    }
  })[]
  relatedAgents: AgentTemplateWithStats[]
  isAuthenticated: boolean
  currentUserId?: string
}

export function AgentDetailClient({
  agent,
  ratings,
  relatedAgents,
  isAuthenticated,
  currentUserId
}: AgentDetailClientProps) {
  const router = useRouter()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(agent.is_favorite || false)
  const [isInCollection, setIsInCollection] = useState(agent.is_in_collection || false)
  const [isRateModalOpen, setIsRateModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'rendered' | 'source'>('rendered')
  const [copied, setCopied] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [visibility, setVisibility] = useState(agent.visibility)
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false)

  const category = AGENT_CATEGORIES[agent.category as keyof typeof AGENT_CATEGORIES] || AGENT_CATEGORIES.general
  const CategoryIcon = CATEGORY_ICONS[agent.category?.toLowerCase() || ''] || DEFAULT_CATEGORY_ICON
  const isOwner = currentUserId === agent.user_id

  // Track agent view in activity history
  useEffect(() => {
    if (isAuthenticated) {
      trackAgentActivity(agent.id, 'view')
    }
  }, [agent.id, isAuthenticated])

  const handleDownload = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save templates')
      router.push('/login')
      return
    }

    if (isInCollection && !isOwner) {
      // Already saved — just download the file
      const blob = new Blob([agent.content || ''], { type: 'text/markdown' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${agent.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success(`${agent.name} downloaded!`)
      return
    }

    setIsDownloading(true)
    try {
      // Track download and add to collection
      const response = await fetch(`/api/agents/${agent.id}/download`, {
        method: 'POST'
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || 'Failed to save template')
        return
      }

      const data = await response.json()

      if (!isOwner) {
        setIsInCollection(true)
        if (data.alreadyExists) {
          toast.success(`${agent.name} is already in My Templates!`)
        } else {
          toast.success(`${agent.name} saved to My Templates!`)
        }
        router.refresh()

        // Open rating modal after successful save (only if not owner and hasn't rated yet)
        if (!agent.user_rating) {
          setTimeout(() => {
            setIsRateModalOpen(true)
          }, 500)
        }
      } else {
        // Owner downloading their own template
        const blob = new Blob([agent.content || ''], { type: 'text/markdown' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${agent.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success(`${agent.name} downloaded!`)
        router.refresh()
      }
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error('An error occurred')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!isAuthenticated || !isInCollection) {
      return
    }

    try {
      setIsFavorite(!isFavorite)
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites')
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('An error occurred')
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const handleCopyContent = async () => {
    if (!agent.content) {
      toast.error('No content to copy')
      return
    }

    try {
      let textToCopy = agent.content

      if (viewMode === 'rendered') {
        textToCopy = agent.content
          .replace(/^#{1,6}\s+/gm, '')
          .replace(/(\*\*|__)(.*?)\1/g, '$2')
          .replace(/(\*|_)(.*?)\1/g, '$2')
          .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
          .replace(/`([^`]+)`/g, '$1')
          .replace(/```[\s\S]*?```/g, (match) => {
            return match.replace(/```\w*\n?/g, '').replace(/```$/g, '')
          })
          .replace(/^>\s+/gm, '')
          .replace(/^(-{3,}|_{3,}|\*{3,})$/gm, '')
          .replace(/^[\s]*[-*+]\s+/gm, '')
          .replace(/^[\s]*\d+\.\s+/gm, '')
          .replace(/\n{3,}/g, '\n\n')
          .trim()
      }

      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      toast.success(viewMode === 'rendered' ? 'Plain text copied' : 'Markdown copied')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy error:', error)
      toast.error('Failed to copy content')
    }
  }

  const handleToggleVisibility = async () => {
    if (!isOwner) return

    setIsUpdatingVisibility(true)
    const newVisibility = visibility === 'public' ? 'private' : 'public'

    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: agent.name,
          description: agent.description,
          content: agent.content,
          category: agent.category,
          tags: agent.tags,
          version: agent.version,
          visibility: newVisibility,
          dependencies: agent.dependencies
        })
      })

      if (response.ok) {
        setVisibility(newVisibility)
        toast.success(`Template is now ${newVisibility}`)
        router.refresh()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to update visibility')
      }
    } catch (error) {
      console.error('Error updating visibility:', error)
      toast.error('An error occurred')
    } finally {
      setIsUpdatingVisibility(false)
    }
  }

  const handleDelete = async () => {
    if (!isOwner) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Template moved to trash')
        router.push('/dashboard/deleted-templates')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete template')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('An error occurred')
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </button>

      {/* Header */}
      <div className="bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-md bg-neutral-100 dark:bg-surface-container-high flex items-center justify-center shrink-0">
              <CategoryIcon size={20} strokeWidth={1.5} className="text-neutral-500 dark:text-neutral-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                {agent.name}
              </h1>
              {agent.description && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {agent.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-1.5 shrink-0">
            {isOwner && (
              <>
                <button
                  onClick={handleToggleVisibility}
                  disabled={isUpdatingVisibility}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] text-neutral-600 dark:text-neutral-400 rounded-md text-xs font-medium hover:bg-neutral-50 dark:hover:bg-surface-container-high transition-all disabled:opacity-50"
                  title={visibility === 'public' ? 'Make private' : 'Make public'}
                >
                  {visibility === 'public' ? (
                    <><Globe className="h-3.5 w-3.5" />Public</>
                  ) : (
                    <><Lock className="h-3.5 w-3.5" />Private</>
                  )}
                </button>
                <button
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="p-1.5 bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] text-neutral-400 dark:text-neutral-500 rounded-md hover:bg-neutral-50 dark:hover:bg-surface-container-high hover:text-red-500 transition-all"
                  title="Delete template"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
            {isInCollection && !isOwner && (
              <button
                onClick={handleToggleFavorite}
                className="p-1.5 bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] text-neutral-400 dark:text-neutral-500 rounded-md hover:bg-neutral-50 dark:hover:bg-surface-container-high transition-all"
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            )}
            <button
              onClick={handleShare}
              className="p-1.5 bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] text-neutral-400 dark:text-neutral-500 rounded-md hover:bg-neutral-50 dark:hover:bg-surface-container-high transition-all"
              title="Share"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Tags */}
        {agent.tags && agent.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {agent.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-surface-container-high text-neutral-500 dark:text-neutral-400 text-[11px] font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <SignalBars value={agent.rating_average || 0} />
            <div>
              <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                {agent.rating_average?.toFixed(1) || '0.0'}
              </p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                {agent.rating_count || 0} reviews
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
            <div>
              <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                {agent.download_count || 0}
              </p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500">saves</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
            <div>
              <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">v{agent.version}</p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500">version</p>
            </div>
          </div>
        </div>

        {/* Actions — Rate */}
        {!isOwner && isAuthenticated && (
          <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-white/[0.09] flex">
            <button
              onClick={() => setIsRateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-surface-container-high border border-neutral-200 dark:border-white/[0.09] text-neutral-700 dark:text-neutral-300 rounded-md text-xs font-medium hover:bg-neutral-100 dark:hover:bg-surface-container-high/80 transition-all"
            >
              <SignalBars value={agent.user_rating || 3} size="sm" />
              {agent.user_rating ? 'Update Rating' : 'Rate'}
            </button>
          </div>
        )}

        {/* Owner actions */}
        {isOwner && (
          <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-white/[0.09] flex items-center justify-between">
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              You cannot rate your own template
            </span>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] text-neutral-600 dark:text-neutral-400 rounded-md text-xs font-medium hover:bg-neutral-50 dark:hover:bg-surface-container-high transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {isDownloading ? 'Downloading...' : 'Download .md'}
            </button>
          </div>
        )}
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-1 bg-neutral-100 dark:bg-surface-container-high p-1 rounded-md w-fit">
        <button
          onClick={() => setViewMode('rendered')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
            viewMode === 'rendered'
              ? 'bg-white dark:bg-surface-container text-neutral-900 dark:text-neutral-100 shadow-sm'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          Rendered
        </button>
        <button
          onClick={() => setViewMode('source')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
            viewMode === 'source'
              ? 'bg-white dark:bg-surface-container text-neutral-900 dark:text-neutral-100 shadow-sm'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
          }`}
        >
          <Code className="h-3.5 w-3.5" />
          Source
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-lg overflow-hidden">
        {/* Copy Button */}
        <div className="flex justify-end px-5 pt-4 pb-2 border-b border-neutral-100 dark:border-white/[0.09]">
          <button
            onClick={handleCopyContent}
            className="p-1.5 bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] text-neutral-500 dark:text-neutral-400 rounded-md hover:bg-neutral-50 dark:hover:bg-surface-container-high transition-all"
            title={viewMode === 'rendered' ? 'Copy as plain text' : 'Copy markdown source'}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        <div className="p-6">
          {viewMode === 'rendered' ? (
            <div className="prose prose-slate max-w-none prose-sm">
              {agent.content ? (
                <ReactMarkdown
                  components={{
                    code({ node, className, children, ...props }) {
                      const content = String(children).replace(/\n$/, '')
                      const isInline = !className?.startsWith('language-')
                      
                      if (isInline) {
                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        )
                      }
                      
                      return (
                        <MarkdownCodeBlock className={className}>
                          {content}
                        </MarkdownCodeBlock>
                      )
                    },
                  }}
                >
                  {agent.content}
                </ReactMarkdown>
              ) : (
                <div className="text-center py-10 text-neutral-400 dark:text-neutral-600">
                  <FileText className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No content available</p>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <pre className="bg-neutral-950 text-neutral-300 p-5 rounded-md overflow-x-auto text-xs leading-relaxed">
                <code>{agent.content || '// No content'}</code>
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Author & Metadata */}
      {agent.profiles && (
        <div className="border border-neutral-200 dark:border-white/[0.09] rounded-lg bg-white dark:bg-surface-container">
          <p className="px-5 py-3 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide border-b border-neutral-100 dark:border-white/[0.09]">Author</p>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-surface-container-high flex items-center justify-center text-neutral-500 dark:text-neutral-400 font-semibold text-sm shrink-0">
                {agent.profiles.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {agent.profiles.full_name || 'Unknown'}
                </p>
                {agent.profiles.bio && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {agent.profiles.bio}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-100 dark:border-white/[0.09]">
              <div>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mb-0.5">Published</p>
                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {new Date(agent.created_at!).toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'short', day: 'numeric' 
                  })}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mb-0.5">Last Updated</p>
                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {new Date(agent.updated_at!).toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'short', day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ratings & Reviews */}
      {ratings.length > 0 && (
        <div className="bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] rounded-lg p-5">
          <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-4">
            Reviews ({ratings.length})
          </p>
          <div className="space-y-3">
            {ratings.map((rating) => {
              const ratingProfile = Array.isArray(rating.profiles) ? rating.profiles[0] : rating.profiles
              return (
                <div key={rating.id} className="p-3 bg-neutral-50 dark:bg-surface-container-high/60 border border-neutral-100 dark:border-white/[0.09] rounded-md">
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-surface-container-high flex items-center justify-center text-neutral-600 dark:text-neutral-400 font-medium text-xs shrink-0">
                        {ratingProfile?.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                          {ratingProfile?.full_name || 'Anonymous'}
                        </p>
                        <SignalBars value={rating.rating} size="sm" />
                      </div>
                    </div>
                    <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                      {new Date(rating.created_at!).toLocaleDateString('en-US', { 
                        year: 'numeric', month: 'short', day: 'numeric' 
                      })}
                    </span>
                  </div>
                  {rating.review && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1.5 pl-9">{rating.review}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Rate Template Modal */}
      <RateTemplateModal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        agentId={agent.id}
        agentName={agent.name}
        currentRating={agent.user_rating}
        onSuccess={() => router.refresh()}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white dark:bg-surface-container sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500 shrink-0" />
              <DialogTitle className="text-sm font-semibold text-neutral-900">
                Delete Template
              </DialogTitle>
            </div>
            <DialogDescription className="pt-2 text-xs text-neutral-500">
              Are you sure you want to delete <strong className="text-neutral-700 font-medium">{agent.name}</strong>?
              <span className="block mt-2 p-2.5 bg-neutral-50 dark:bg-surface-container-high border border-neutral-200 dark:border-white/[0.09] rounded-md">
                The template will be moved to trash and automatically deleted after 30 days.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Deleting...' : 'Move to Trash'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
