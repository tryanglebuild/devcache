'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Download, ArrowLeft, Heart, Share2, Play, History } from 'lucide-react'
import { AgentCard } from '@/components/agents/AgentCard'
import { RatingSection } from './RatingSection'
import { AgentExecutor } from '@/components/agents/AgentExecutor'
import { ExecutionHistory } from '@/components/agents/ExecutionHistory'
import type { AgentTemplateWithStats, AgentRating } from '@/types/agents.types'
import { AGENT_CATEGORIES } from '@/types/agents.types'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'

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
  const [activeTab, setActiveTab] = useState<'about' | 'execute' | 'history'>('about')

  const category = AGENT_CATEGORIES[agent.category as keyof typeof AGENT_CATEGORIES] || AGENT_CATEGORIES.general
  const isOwner = currentUserId === agent.user_id

  const handleDownload = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to download agents')
      router.push('/login')
      return
    }

    setIsDownloading(true)
    try {
      const response = await fetch(`/api/agents/${agent.id}/download`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success(`${agent.name} added to your collection!`)
        router.refresh()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to download agent')
      }
    } catch (error) {
      console.error('Error downloading agent:', error)
      toast.error('An error occurred')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!isAuthenticated || !agent.is_in_collection) {
      return
    }

    try {
      // TODO: Implement favorite toggle API
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

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[#464554] hover:text-[#191c1e] font-semibold mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Marketplace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agent Header */}
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="flex items-start gap-6">
              <div
                className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${category.color}15`, color: category.color }}
              >
                <span className="material-symbols-outlined text-4xl">
                  {category.icon}
                </span>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h1 className="text-3xl font-black text-[#191c1e] mb-2">
                      {agent.name}
                    </h1>
                    <span
                      className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                      style={{ backgroundColor: `${category.color}15`, color: category.color }}
                    >
                      {category.label}
                    </span>
                  </div>
                </div>

                {agent.description && (
                  <p className="text-[#464554] mt-4">{agent.description}</p>
                )}

                {/* Tags */}
                {agent.tags && agent.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {agent.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#f2f4f6] text-[#464554] rounded-lg text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-[#fbbf24] text-[#fbbf24]" />
                    <span className="font-bold text-[#191c1e]">
                      {agent.rating_average?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-sm text-[#464554]">
                      ({agent.rating_count || 0} reviews)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[#464554]">
                    <Download className="w-5 h-5" />
                    <span className="font-semibold">
                      {agent.download_count || 0} downloads
                    </span>
                  </div>

                  <div className="text-sm text-[#464554]">
                    v{agent.version}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex border-b border-[#c7c4d7]/10">
              <button
                onClick={() => setActiveTab('about')}
                className={`flex-1 px-6 py-4 font-bold text-sm transition-all ${
                  activeTab === 'about'
                    ? 'text-[#4648d4] border-b-2 border-[#4648d4] bg-[#4648d4]/5'
                    : 'text-[#464554] hover:text-[#191c1e] hover:bg-[#f7f9fb]'
                }`}
              >
                About
              </button>
              {agent.is_in_collection && (
                <>
                  <button
                    onClick={() => setActiveTab('execute')}
                    className={`flex-1 px-6 py-4 font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'execute'
                        ? 'text-[#4648d4] border-b-2 border-[#4648d4] bg-[#4648d4]/5'
                        : 'text-[#464554] hover:text-[#191c1e] hover:bg-[#f7f9fb]'
                    }`}
                  >
                    <Play className="w-4 h-4" />
                    Execute
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 px-6 py-4 font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'history'
                        ? 'text-[#4648d4] border-b-2 border-[#4648d4] bg-[#4648d4]/5'
                        : 'text-[#464554] hover:text-[#191c1e] hover:bg-[#f7f9fb]'
                    }`}
                  >
                    <History className="w-4 h-4" />
                    History
                  </button>
                </>
              )}
            </div>

            <div className="p-8">
              {/* About Tab */}
              {activeTab === 'about' && (
                <div>
                  <h2 className="text-2xl font-bold text-[#191c1e] mb-4">
                    About This Agent
                  </h2>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{agent.content}</ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Execute Tab */}
              {activeTab === 'execute' && agent.is_in_collection && (
                <div>
                  <h2 className="text-2xl font-bold text-[#191c1e] mb-4">
                    Execute Agent
                  </h2>
                  <AgentExecutor agent={agent} />
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && agent.is_in_collection && (
                <div>
                  <h2 className="text-2xl font-bold text-[#191c1e] mb-4">
                    Execution History
                  </h2>
                  <ExecutionHistory agentId={agent.id} />
                </div>
              )}
            </div>
          </div>

          {/* Ratings & Reviews */}
          <RatingSection
            agentId={agent.id}
            ratings={ratings}
            userRating={agent.user_rating ?? null}
            isAuthenticated={isAuthenticated}
            isOwner={isOwner}
          />
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm sticky top-6">
            <div className="space-y-3">
              {!isOwner && (
                <>
                  {agent.is_in_collection ? (
                    <button
                      onClick={handleToggleFavorite}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-[#4648d4] text-[#4648d4] rounded-lg font-bold hover:bg-[#f7f9fb] transition-all"
                    >
                      <Heart
                        className={`w-5 h-5 ${isFavorite ? 'fill-[#4648d4]' : ''}`}
                      />
                      {isFavorite ? 'Favorited' : 'Add to Favorites'}
                    </button>
                  ) : (
                    <button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-[#4648d4] to-[#6063ee] text-white rounded-lg font-bold shadow-lg shadow-[#4648d4]/20 hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      <Download className="w-5 h-5" />
                      {isDownloading ? 'Downloading...' : 'Download Agent'}
                    </button>
                  )}

                  <button
                    onClick={() => setActiveTab('execute')}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#10b981] text-white rounded-lg font-bold hover:bg-[#059669] transition-all"
                    disabled={!agent.is_in_collection}
                  >
                    <Play className="w-5 h-5" />
                    Execute Agent
                  </button>
                </>
              )}

              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[#c7c4d7]/20 text-[#464554] rounded-lg font-semibold hover:bg-[#f2f4f6] transition-all"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>

            {/* Author Info */}
            {agent.profiles && (
              <div className="mt-6 pt-6 border-t border-[#c7c4d7]/10">
                <p className="text-xs font-bold text-[#464554] uppercase tracking-wider mb-3">
                  Created By
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4648d4] to-[#6063ee] flex items-center justify-center text-white font-bold">
                    {agent.profiles.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-[#191c1e]">
                      {agent.profiles.full_name || 'Unknown'}
                    </p>
                    {agent.profiles.bio && (
                      <p className="text-xs text-[#464554] line-clamp-2">
                        {agent.profiles.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="mt-6 pt-6 border-t border-[#c7c4d7]/10 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#464554]">Published</span>
                <span className="font-semibold text-[#191c1e]">
                  {new Date(agent.created_at!).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#464554]">Last Updated</span>
                <span className="font-semibold text-[#191c1e]">
                  {new Date(agent.updated_at!).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Related Agents */}
          {relatedAgents.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-[#191c1e] mb-4">
                Related Agents
              </h3>
              <div className="space-y-4">
                {relatedAgents.map((relatedAgent) => (
                  <AgentCard
                    key={relatedAgent.id}
                    agent={relatedAgent}
                    onView={(agent) => router.push(`/marketplace/${agent.id}`)}
                    compact
                  />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
