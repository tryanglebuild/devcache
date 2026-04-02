'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SearchableFAQ } from './SearchableFAQ'
import { cn } from '@/lib/utils'

interface SupportPageClientProps {
  isAuthenticated: boolean
}

type SupportSection = 'getting-started' | 'features' | 'tutorials' | 'faq'

export function SupportPageClient({ isAuthenticated }: SupportPageClientProps) {
  const [activeSection, setActiveSection] = useState<SupportSection>('getting-started')

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <span className="material-symbols-outlined text-sm">support_agent</span>
              <span className="text-xs font-bold tracking-wider uppercase">Help Center</span>
            </div>
            <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
              How can we help you?
            </h1>
            <p className="text-xl text-indigo-100">
              Find tutorials, guides, and answers to common questions about DevCache
            </p>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="max-w-[90%] mx-auto px-6 py-12">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <nav className="space-y-2">
                <SidebarNavItem
                  icon="rocket_launch"
                  label="Getting Started"
                  isActive={activeSection === 'getting-started'}
                  onClick={() => setActiveSection('getting-started')}
                />
                <SidebarNavItem
                  icon="widgets"
                  label="Features"
                  isActive={activeSection === 'features'}
                  onClick={() => setActiveSection('features')}
                />
                <SidebarNavItem
                  icon="school"
                  label="Tutorials"
                  isActive={activeSection === 'tutorials'}
                  onClick={() => setActiveSection('tutorials')}
                />
                <SidebarNavItem
                  icon="help"
                  label="FAQ"
                  isActive={activeSection === 'faq'}
                  onClick={() => setActiveSection('faq')}
                />
              </nav>

              {/* Quick Links - Only show for authenticated users */}
              {isAuthenticated && (
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 px-3">
                    Quick Links
                  </p>
                  <div className="space-y-1">
                    <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-sm">dashboard</span>
                      Dashboard
                    </Link>
                    <Link href="/marketplace" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-sm">store</span>
                      Marketplace
                    </Link>
                    <Link href="/chat" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-sm">chat</span>
                      AI Chat
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {activeSection === 'getting-started' && <GettingStartedContent />}
            {activeSection === 'features' && <FeaturesContent />}
            {activeSection === 'tutorials' && <TutorialsContent />}
            {activeSection === 'faq' && <FAQContent />}
          </main>
        </div>

        {/* Contact Support Section */}
        <div className="mt-20 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-12 text-center border border-slate-700">
          <span className="material-symbols-outlined text-indigo-400 text-5xl mb-6 inline-block">
            support_agent
          </span>
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Still need help?
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Our support team is here to help. Reach out via email or join our community Discord server.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@devcache.com"
              className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition-all shadow-lg"
            >
              <span className="material-symbols-outlined">email</span>
              Email Support
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg"
            >
              <span className="material-symbols-outlined">forum</span>
              Join Discord
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// Sidebar Navigation Item
function SidebarNavItem({ icon, label, isActive, onClick }: {
  icon: string
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left',
        isActive
          ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-sm'
          : 'text-slate-600 hover:bg-slate-50'
      )}
    >
      <span className="material-symbols-outlined text-xl">{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  )
}

// Getting Started Content
function GettingStartedContent() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Getting Started</h2>
        <p className="text-slate-600 text-lg">Quick guides to help you start using DevCache</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickStartCard
          icon="rocket_launch"
          title="Quick Start Guide"
          description="Get up and running with DevCache in 5 minutes"
          href="/support/quick-start"
          time="5 min read"
        />
        <QuickStartCard
          icon="account_circle"
          title="Create Your Account"
          description="Sign up and set up your profile"
          href="/signup"
          time="2 min"
        />
        <QuickStartCard
          icon="smart_toy"
          title="Your First Agent"
          description="Learn how to create and publish your first AI agent"
          href="/support/first-agent"
          time="10 min read"
        />
        <QuickStartCard
          icon="folder"
          title="Project Management"
          description="Organize your code snippets and templates"
          href="/support/projects"
          time="7 min read"
        />
      </div>
    </div>
  )
}

// Features Content
function FeaturesContent() {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Core Features</h2>
        <p className="text-slate-600 text-lg">Explore everything DevCache has to offer</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeatureCard
          icon="smart_toy"
          name="AI Agent Templates"
          description="Create, customize, and execute specialized AI agents for different tasks"
          topics={['Creating agents', 'Agent configuration', 'Execution history', 'Version control']}
        />
        <FeatureCard
          icon="store"
          name="Marketplace"
          description="Browse, download, and share agents with the community"
          topics={['Publishing agents', 'Rating system', 'Download tracking', 'Trending agents']}
        />
        <FeatureCard
          icon="folder_open"
          name="Project Organization"
          description="Manage files, folders, and code snippets with smart tagging"
          topics={['File uploads', 'Folder structure', 'Favorites', 'Search & filter']}
        />
        <FeatureCard
          icon="chat"
          name="AI Chat Assistant"
          description="Context-aware chat to find templates and get help"
          topics={['Chat sessions', 'Model selection', 'Context search', 'Message history']}
        />
        <FeatureCard
          icon="label"
          name="Tags & Collections"
          description="Organize content with custom tags and collections"
          topics={['Creating tags', 'Tag analytics', 'Collection management', 'Filtering']}
        />
        <FeatureCard
          icon="psychology"
          name="Smart Search"
          description="AI-powered semantic search across all your content"
          topics={['Embeddings', 'Hybrid search', 'Relevance scoring', 'Context matching']}
        />
      </div>
    </div>
  )
}

// Tutorials Content
function TutorialsContent() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Tutorials</h2>
        <p className="text-slate-600 text-lg">Step-by-step guides for all skill levels</p>
      </div>

      <div className="space-y-6">
        <TutorialCard
          level="beginner"
          icon="play_circle"
          title="Getting Started with DevCache"
          description="Complete walkthrough from signup to your first agent execution"
          duration="15 min"
          steps={5}
          href="/support/quick-start"
        />
        <TutorialCard
          level="beginner"
          icon="edit_note"
          title="Creating Your First Agent Template"
          description="Step-by-step guide to building a custom AI agent"
          duration="20 min"
          steps={7}
          href="/support/first-agent"
        />
        <TutorialCard
          level="intermediate"
          icon="publish"
          title="Publishing to the Marketplace"
          description="Share your agents with the community and build your reputation"
          duration="10 min"
          steps={4}
          href="/support"
        />
        <TutorialCard
          level="intermediate"
          icon="folder_managed"
          title="Advanced Project Organization"
          description="Master tags, collections, and smart search features"
          duration="25 min"
          steps={8}
          href="/support/projects"
        />
        <TutorialCard
          level="advanced"
          icon="psychology"
          title="Multi-Agent Orchestration"
          description="Coordinate multiple agents to solve complex problems"
          duration="30 min"
          steps={10}
          href="/support"
        />
        <TutorialCard
          level="advanced"
          icon="integration_instructions"
          title="API Integration & Automation"
          description="Integrate DevCache into your development workflow"
          duration="35 min"
          steps={12}
          href="/support"
        />
      </div>
    </div>
  )
}

// FAQ Content
function FAQContent() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Frequently Asked Questions</h2>
        <p className="text-slate-600 text-lg">Find answers to common questions</p>
      </div>
      <SearchableFAQ />
    </div>
  )
}

// Quick Start Card Component
function QuickStartCard({ icon, title, description, href, time }: {
  icon: string
  title: string
  description: string
  href: string
  time: string
}) {
  return (
    <Link href={href}>
      <Card className="p-6 hover:shadow-lg transition-all border-slate-200 bg-white rounded-2xl group cursor-pointer h-full">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors flex-shrink-0">
            <span className="material-symbols-outlined text-xl">{icon}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
              {title}
            </h3>
            <p className="text-slate-600 mb-3 leading-relaxed text-sm">
              {description}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="material-symbols-outlined text-xs">schedule</span>
              <span>{time}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}

// Feature Card Component
function FeatureCard({ icon, name, description, topics }: {
  icon: string
  name: string
  description: string
  topics: string[]
}) {
  return (
    <Card className="p-6 border-slate-200 bg-white rounded-2xl hover:shadow-lg transition-all h-full">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{name}</h3>
          <p className="text-slate-600 leading-relaxed text-sm">{description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic, idx) => (
          <Badge key={idx} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg px-2 py-1 text-xs">
            {topic}
          </Badge>
        ))}
      </div>
    </Card>
  )
}

// Tutorial Card Component
function TutorialCard({ level, icon, title, description, duration, steps, href }: {
  level: 'beginner' | 'intermediate' | 'advanced'
  icon: string
  title: string
  description: string
  duration: string
  steps: number
  href: string
}) {
  const levelColors = {
    beginner: 'bg-green-50 text-green-700 border-green-200',
    intermediate: 'bg-blue-50 text-blue-700 border-blue-200',
    advanced: 'bg-purple-50 text-purple-700 border-purple-200'
  }

  return (
    <Link href={href}>
      <Card className="p-6 border-slate-200 bg-white rounded-2xl hover:shadow-lg transition-all cursor-pointer group">
        <div className="flex items-start gap-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors flex-shrink-0">
            <span className="material-symbols-outlined text-2xl">{icon}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <Badge className={`${levelColors[level]} border rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider`}>
                {level}
              </Badge>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">schedule</span>
                {duration}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">list</span>
                {steps} steps
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
              {title}
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              {description}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  )
}
