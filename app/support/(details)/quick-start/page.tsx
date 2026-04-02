import Link from 'next/link'
import { Card } from '@/components/ui/card'

export const metadata = {
  title: 'Quick Start Guide | DevCache Support',
  description: 'Get started with DevCache in 5 minutes',
}

export default function QuickStartPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-8">
          <Link href="/support" className="hover:text-indigo-600">Support</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-slate-900 font-semibold">Quick Start Guide</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full mb-4 border border-green-200">
            <span className="material-symbols-outlined text-sm">rocket_launch</span>
            <span className="text-xs font-bold tracking-wider uppercase">Beginner</span>
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Quick Start Guide
          </h1>
          <p className="text-xl text-slate-600">
            Get up and running with DevCache in just 5 minutes
          </p>
          <div className="flex items-center gap-6 mt-6 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">schedule</span>
              5 min read
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">list</span>
              5 steps
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <StepCard
            number={1}
            title="Create Your Account"
            icon="account_circle"
          >
            <p>Visit <Link href="/signup" className="text-indigo-600 font-semibold">devcache.com/signup</Link> and create your account using:</p>
            <ul>
              <li>Email and password</li>
              <li>GitHub OAuth (recommended for developers)</li>
            </ul>
            <p>You&apos;ll receive a verification email. Click the link to activate your account.</p>
          </StepCard>

          <StepCard
            number={2}
            title="Complete Your Profile"
            icon="edit"
          >
            <p>Navigate to <strong>Dashboard → Settings → Profile</strong> and add:</p>
            <ul>
              <li>Full name and avatar</li>
              <li>Bio and job title</li>
              <li>Social links (GitHub, LinkedIn, Twitter)</li>
            </ul>
            <p>A complete profile helps build trust when sharing agents in the marketplace.</p>
          </StepCard>

          <StepCard
            number={3}
            title="Explore the Marketplace"
            icon="store"
          >
            <p>Visit the <Link href="/marketplace" className="text-indigo-600 font-semibold">Marketplace</Link> to discover AI agents created by the community:</p>
            <ul>
              <li>Browse by category (Development, Testing, Documentation, etc.)</li>
              <li>Check ratings and reviews</li>
              <li>Click &quot;Add to Collection&quot; to download agents</li>
            </ul>
            <p>Try popular agents like &quot;Supabase Expert&quot; or &quot;Next.js Performance&quot; to see how they work.</p>
          </StepCard>

          <StepCard
            number={4}
            title="Create Your First Project"
            icon="folder"
          >
            <p>Go to <strong>Dashboard → Projects</strong> and organize your code:</p>
            <ul>
              <li>Click &quot;Create Folder&quot; to organize by project or category</li>
              <li>Upload code files, snippets, or documentation</li>
              <li>Add descriptions and tags for easy searching</li>
              <li>Mark important items as favorites</li>
            </ul>
            <p>DevCache automatically indexes your content for AI-powered search.</p>
          </StepCard>

          <StepCard
            number={5}
            title="Try the AI Chat"
            icon="chat"
          >
            <p>Open the <Link href="/chat" className="text-indigo-600 font-semibold">Chat</Link> interface to interact with your content:</p>
            <ul>
              <li>Ask questions about your projects</li>
              <li>Search for specific templates or code snippets</li>
              <li>Get recommendations for agents</li>
              <li>Select different AI models based on your needs</li>
            </ul>
            <p>The chat assistant understands your entire workspace context.</p>
          </StepCard>

          {/* Next Steps */}
          <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200 p-8 rounded-2xl mt-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600">celebration</span>
              You&apos;re all set!
            </h3>
            <p className="text-slate-700 mb-6 leading-relaxed">
              Now that you&apos;ve completed the basics, explore these advanced features:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/support/first-agent" className="flex items-center gap-3 bg-white p-4 rounded-xl hover:shadow-md transition-all border border-slate-200">
                <span className="material-symbols-outlined text-indigo-600">smart_toy</span>
                <span className="font-semibold text-slate-900">Create Your First Agent</span>
              </Link>
              <Link href="/support/projects" className="flex items-center gap-3 bg-white p-4 rounded-xl hover:shadow-md transition-all border border-slate-200">
                <span className="material-symbols-outlined text-indigo-600">folder_managed</span>
                <span className="font-semibold text-slate-900">Advanced Organization</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StepCard({ number, title, icon, children }: {
  number: number
  title: string
  icon: string
  children: React.ReactNode
}) {
  return (
    <Card className="p-8 mb-8 border-slate-200 bg-white rounded-2xl shadow-sm">
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <span className="material-symbols-outlined text-3xl">{icon}</span>
          </div>
          <div className="mt-4 text-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm">
              {number}
            </span>
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{title}</h2>
          <div className="text-slate-600 leading-relaxed space-y-4">
            {children}
          </div>
        </div>
      </div>
    </Card>
  )
}
