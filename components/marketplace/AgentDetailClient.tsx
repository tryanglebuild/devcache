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
              ? 'bg-[#6366f1]/70 dark:bg-[#7c7ff5]/60'
              : 'bg-slate-200 dark:bg-slate-700'
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
        className="flex items-center gap-2 text-[#464554] dark:text-on-surface-variant hover:text-[#191c1e] dark:hover:text-on-surface font-semibold transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Marketplace
      </button>

      {/* Header */}
      <div className="bg-white dark:bg-surface-container p-8 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] dark:shadow-none dark:ring-1 dark:ring-white/[0.08]">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4 flex-1">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{ background: `linear-gradient(135deg, ${category.color} 0%, ${category.color}dd 100%)` }}
              >
                <CategoryIcon size={32} strokeWidth={1.5} />
              </div>
            <div className="flex-1">
              <h1 className="text-3xl font-black tracking-tight text-[#191c1e] dark:text-on-surface mb-2">
                {agent.name}
              </h1>
              {agent.description && (
                <p className="text-[#464554] dark:text-on-surface-variant font-medium">
                  {agent.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {isOwner && (
              <>
                <button
                  onClick={handleToggleVisibility}
                  disabled={isUpdatingVisibility}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-surface border border-[#c7c4d7]/30 dark:border-white/[0.09] text-[#191c1e] dark:text-on-surface rounded-lg hover:bg-[#f2f4f6] dark:hover:bg-surface-container-high transition-all disabled:opacity-50"
                  title={visibility === 'public' ? 'Make private' : 'Make public'}
                >
                  {visibility === 'public' ? (
                    <>
                      <Globe className="h-4 w-4" />
                      <span className="text-sm font-semibold">Public</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span className="text-sm font-semibold">Private</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="p-2.5 bg-white dark:bg-surface border border-gray-200 dark:border-white/[0.09] text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-container-high transition-all"
                  title="Delete template"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
            {isInCollection && !isOwner && (
              <button
                onClick={handleToggleFavorite}
                className="p-2.5 bg-white dark:bg-surface border border-[#c7c4d7]/30 dark:border-white/[0.09] text-[#191c1e] dark:text-on-surface rounded-lg hover:bg-[#f2f4f6] dark:hover:bg-surface-container-high transition-all"
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-[#904900] text-[#904900]' : ''}`} />
              </button>
            )}
            <button
              onClick={handleShare}
              className="p-2.5 bg-white dark:bg-surface border border-[#c7c4d7]/30 dark:border-white/[0.09] text-[#191c1e] dark:text-on-surface rounded-lg hover:bg-[#f2f4f6] dark:hover:bg-surface-container-high transition-all"
              title="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tags */}
        {agent.tags && agent.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {agent.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white shadow-md"
                style={{ backgroundColor: category.color }}
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
              <p className="font-bold text-[#191c1e] dark:text-on-surface">
                {agent.rating_average?.toFixed(1) || '0.0'}
              </p>
              <p className="text-xs text-[#464554] dark:text-on-surface-variant">
                {agent.rating_count || 0} reviews
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-[#464554] dark:text-on-surface-variant" />
            <div>
              <p className="font-bold text-[#191c1e] dark:text-on-surface">
                {agent.download_count || 0}
              </p>
              <p className="text-xs text-[#464554] dark:text-on-surface-variant">saves</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#464554] dark:text-on-surface-variant" />
            <div>
              <p className="font-bold text-[#191c1e] dark:text-on-surface">v{agent.version}</p>
              <p className="text-xs text-[#464554] dark:text-on-surface-variant">version</p>
            </div>
          </div>
        </div>

        {/* Actions — Rate */}
        {!isOwner && isAuthenticated && (
          <div className="mt-6 pt-6 border-t border-[#c7c4d7]/10 dark:border-white/[0.06] flex">
            <button
              onClick={() => setIsRateModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-surface-container-high text-[#191c1e] dark:text-on-surface rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-surface-container transition-all"
            >
              <SignalBars value={agent.user_rating || 3} size="sm" />
              {agent.user_rating ? 'Update Rating' : 'Rate'}
            </button>
          </div>
        )}

        {/* Owner actions */}
        {isOwner && (
          <div className="mt-6 pt-6 border-t border-[#c7c4d7]/10 dark:border-white/[0.06] flex items-center justify-between">
            <span className="text-sm text-[#464554] dark:text-on-surface-variant">
              You cannot rate your own template
            </span>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-[#f2f4f6] dark:bg-surface-container-high text-[#464554] dark:text-on-surface-variant rounded-lg font-semibold text-sm hover:bg-gray-200 dark:hover:bg-surface-container transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? 'Downloading...' : 'Download .md'}
            </button>
          </div>
        )}
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2 bg-white dark:bg-surface-container p-2 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] dark:shadow-none dark:ring-1 dark:ring-white/[0.08] w-fit">
        <button
          onClick={() => setViewMode('rendered')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            viewMode === 'rendered'
              ? 'bg-gradient-to-br from-[#4f46e5] to-[#4338ca] text-white shadow-lg'
              : 'text-[#464554] dark:text-on-surface-variant hover:bg-[#f2f4f6] dark:hover:bg-surface-container-high'
          }`}
        >
          <Eye className="h-4 w-4" />
          Rendered
        </button>
        <button
          onClick={() => setViewMode('source')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            viewMode === 'source'
              ? 'bg-gradient-to-br from-[#4f46e5] to-[#4338ca] text-white shadow-lg'
              : 'text-[#464554] dark:text-on-surface-variant hover:bg-[#f2f4f6] dark:hover:bg-surface-container-high'
          }`}
        >
          <Code className="h-4 w-4" />
          Source
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-surface-container rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] dark:shadow-none dark:ring-1 dark:ring-white/[0.08] overflow-hidden">
        {/* Copy Button */}
        <div className="flex justify-end px-6 pt-6 pb-2 border-b border-[#c7c4d7]/20 dark:border-white/[0.09]">
          <button
            onClick={handleCopyContent}
            className="p-2.5 bg-white dark:bg-surface border border-[#c7c4d7]/30 dark:border-white/[0.09] text-[#191c1e] dark:text-on-surface rounded-lg hover:bg-[#f2f4f6] dark:hover:bg-surface-container-high transition-all"
            title={viewMode === 'rendered' ? 'Copy as plain text' : 'Copy markdown source'}
          >
            {copied ? (
              <Check className="h-4 w-4 text-[#16a34a]" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="p-8">
          {viewMode === 'rendered' ? (
            <div className="prose prose-slate dark:prose-invert max-w-none">
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
                <div className="text-center py-12 text-[#464554] dark:text-on-surface-variant">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No content available</p>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-6 rounded-lg overflow-x-auto">
                <code>{agent.content || '// No content'}</code>
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Author & Metadata */}
      {agent.profiles && (
        <div className="bg-gradient-to-br from-[#4f46e5]/5 dark:from-[#7c7ff5]/5 to-[#4f46e5]/10 dark:to-[#7c7ff5]/10 p-8 rounded-xl border-2 border-[#4f46e5]/20 dark:border-[#7c7ff5]/20">
          <h2 className="text-xl font-black text-[#191c1e] dark:text-on-surface mb-4">
            About the Author
          </h2>
          <div className="bg-white dark:bg-surface p-6 rounded-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4f46e5] to-[#4338ca] flex items-center justify-center text-white font-bold text-lg">
                {agent.profiles.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-bold text-[#191c1e] dark:text-on-surface">
                  {agent.profiles.full_name || 'Unknown'}
                </p>
                {agent.profiles.bio && (
                  <p className="text-sm text-[#464554] dark:text-on-surface-variant">
                    {agent.profiles.bio}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#c7c4d7]/10 dark:border-white/[0.06]">
              <div>
                <p className="text-xs text-[#464554] dark:text-on-surface-variant mb-1">Published</p>
                <p className="font-semibold text-[#191c1e] dark:text-on-surface">
                  {new Date(agent.created_at!).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#464554] dark:text-on-surface-variant mb-1">Last Updated</p>
                <p className="font-semibold text-[#191c1e] dark:text-on-surface">
                  {new Date(agent.updated_at!).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ratings & Reviews */}
      {ratings.length > 0 && (
        <div className="bg-white dark:bg-surface-container p-8 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] dark:shadow-none dark:ring-1 dark:ring-white/[0.08]">
          <h2 className="text-xl font-black text-[#191c1e] dark:text-on-surface mb-6">
            Ratings & Reviews ({ratings.length})
          </h2>
          <div className="space-y-4">
            {ratings.map((rating) => {
              const ratingProfile = Array.isArray(rating.profiles) ? rating.profiles[0] : rating.profiles
              return (
                <div key={rating.id} className="p-4 bg-[#f2f4f6] dark:bg-surface-container-high rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4f46e5] to-[#4338ca] flex items-center justify-center text-white font-bold text-sm">
                        {ratingProfile?.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-[#191c1e] dark:text-on-surface text-sm">
                          {ratingProfile?.full_name || 'Anonymous'}
                        </p>
                        <SignalBars value={rating.rating} size="sm" />
                      </div>
                    </div>
                    <span className="text-xs text-[#464554] dark:text-on-surface-variant">
                      {new Date(rating.created_at!).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  {rating.review && (
                    <p className="text-sm text-[#191c1e] dark:text-on-surface mt-2">{rating.review}</p>
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
            <DialogTitle className="text-xl flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500 dark:text-red-400" />
              Delete Template
            </DialogTitle>
            <DialogDescription className="pt-3">
              Are you sure you want to delete <strong className="text-[#191c1e] dark:text-on-surface font-semibold">{agent.name}</strong>?
              <span className="block mt-3 p-3 bg-gray-50 dark:bg-surface-container-high border border-gray-200 dark:border-white/[0.06] rounded-lg text-sm text-gray-700 dark:text-gray-300 font-medium">
                The template will be moved to trash and automatically deleted after 30 days.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="flex-1 sm:flex-none border-[#c7c4d7]/30 dark:border-white/[0.09] hover:bg-[#f2f4f6] dark:hover:bg-surface-container-high"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              {isDeleting ? 'Deleting...' : 'Move to Trash'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
