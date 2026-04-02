import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Create Your First Agent | DevCache Support',
  description: 'Step-by-step guide to creating your first AI agent template',
}

export default function FirstAgentPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-8">
          <Link href="/support" className="hover:text-indigo-600">Support</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-slate-900 font-semibold">Create Your First Agent</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <Badge className="bg-green-50 text-green-700 border-green-200 border rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider mb-4">
            Beginner Tutorial
          </Badge>
          <h1 className="text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Create Your First AI Agent
          </h1>
          <p className="text-xl text-slate-600">
            Learn how to build, configure, and publish a custom AI agent template
          </p>
          <div className="flex items-center gap-6 mt-6 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">schedule</span>
              10 min read
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">list</span>
              7 steps
            </span>
          </div>
        </div>

        {/* Introduction */}
        <Card className="p-8 mb-12 bg-indigo-50 border-indigo-200 rounded-2xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600">info</span>
            What You&apos;ll Learn
          </h2>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-indigo-600 text-sm mt-0.5">check_circle</span>
              <span>How to define agent capabilities and behavior</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-indigo-600 text-sm mt-0.5">check_circle</span>
              <span>Best practices for agent content structure</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-indigo-600 text-sm mt-0.5">check_circle</span>
              <span>How to test and execute your agent</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-indigo-600 text-sm mt-0.5">check_circle</span>
              <span>Publishing to the marketplace</span>
            </li>
          </ul>
        </Card>

        {/* Steps */}
        <div className="space-y-8">
          <TutorialStep
            number={1}
            title="Navigate to My Templates"
            icon="dashboard"
          >
            <p>From your dashboard, click on <strong>My Templates</strong> in the sidebar or navigate to <code>Dashboard → My Templates</code>.</p>
            <p>This is where all your custom agents live. You&apos;ll see any agents you&apos;ve created or downloaded from the marketplace.</p>
          </TutorialStep>

          <TutorialStep
            number={2}
            title="Click Create New Agent"
            icon="add_circle"
          >
            <p>Click the <strong>&quot;Create Agent&quot;</strong> button in the top right corner. A modal will appear with a form to define your agent.</p>
          </TutorialStep>

          <TutorialStep
            number={3}
            title="Define Basic Information"
            icon="edit_note"
          >
            <p>Fill in the essential details:</p>
            <ul>
              <li><strong>Name</strong>: Choose a clear, descriptive name (e.g., &quot;React Testing Expert&quot;)</li>
              <li><strong>Description</strong>: Explain what your agent does in 1-2 sentences</li>
              <li><strong>Category</strong>: Select the most relevant category (Development, Testing, Documentation, etc.)</li>
              <li><strong>Tags</strong>: Add relevant tags for discoverability (e.g., &quot;react&quot;, &quot;testing&quot;, &quot;jest&quot;)</li>
            </ul>
          </TutorialStep>

          <TutorialStep
            number={4}
            title="Write Agent Content"
            icon="code"
          >
            <p>The content field is where you define your agent&apos;s behavior and knowledge. Here&apos;s a template structure:</p>
            <Card className="bg-slate-900 text-slate-100 p-6 rounded-xl my-4 overflow-x-auto">
              <pre className="text-sm font-mono">{`# React Testing Expert Agent

## Role
You are an expert in React testing using Jest and React Testing Library.

## Capabilities
- Write unit tests for React components
- Create integration tests for user flows
- Debug failing tests
- Suggest testing best practices
- Generate test coverage reports

## Guidelines
1. Always use React Testing Library over Enzyme
2. Focus on testing user behavior, not implementation
3. Use semantic queries (getByRole, getByLabelText)
4. Mock external dependencies appropriately
5. Keep tests simple and readable

## Example Test Pattern
\`\`\`typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('button click updates counter', async () => {
  render(<Counter />)
  const button = screen.getByRole('button', { name: /increment/i })
  await userEvent.click(button)
  expect(screen.getByText('Count: 1')).toBeInTheDocument()
})
\`\`\`

## Response Format
- Provide complete, runnable test code
- Explain testing strategy
- Suggest edge cases to cover`}</pre>
            </Card>
            <p className="text-sm text-slate-600 mt-4">
              <strong>Pro tip</strong>: Use markdown formatting, code blocks, and clear sections to make your agent content easy to understand.
            </p>
          </TutorialStep>

          <TutorialStep
            number={5}
            title="Set Visibility"
            icon="visibility"
          >
            <p>Choose who can access your agent:</p>
            <ul>
              <li><strong>Private</strong>: Only you can see and use it</li>
              <li><strong>Public</strong>: Anyone can discover and download it from the marketplace</li>
            </ul>
            <p>You can change visibility later, so start with &quot;Private&quot; while testing.</p>
          </TutorialStep>

          <TutorialStep
            number={6}
            title="Test Your Agent"
            icon="play_arrow"
          >
            <p>Before publishing, test your agent:</p>
            <ol>
              <li>Click on your newly created agent in the templates list</li>
              <li>Click <strong>&quot;Execute Agent&quot;</strong></li>
              <li>Provide test input in the execution form</li>
              <li>Review the output and refine your agent content if needed</li>
            </ol>
            <Card className="bg-blue-50 border-blue-200 p-6 rounded-xl mt-4">
              <p className="text-blue-900 flex items-start gap-2">
                <span className="material-symbols-outlined text-blue-600 flex-shrink-0">lightbulb</span>
                <span><strong>Testing tip</strong>: Try edge cases and unusual inputs to ensure your agent handles them gracefully.</span>
              </p>
            </Card>
          </TutorialStep>

          <TutorialStep
            number={7}
            title="Publish to Marketplace (Optional)"
            icon="publish"
          >
            <p>Ready to share with the community?</p>
            <ol>
              <li>Open your agent details page</li>
              <li>Click <strong>&quot;Publish to Marketplace&quot;</strong></li>
              <li>Review the information and confirm</li>
              <li>Your agent is now discoverable by other users</li>
            </ol>
            <p>Users can rate and review your agent, helping others discover quality content.</p>
          </TutorialStep>
        </div>

        {/* Next Steps */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-10 rounded-2xl mt-16">
          <h2 className="text-3xl font-bold mb-4">What&apos;s Next?</h2>
          <p className="text-slate-300 mb-8 text-lg">
            Continue your DevCache journey with these advanced topics:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/support/projects" className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl hover:bg-white/20 transition-all border border-white/10">
              <span className="material-symbols-outlined text-indigo-400">folder_managed</span>
              <span className="font-semibold">Advanced Project Organization</span>
            </Link>
            <Link href="/support" className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl hover:bg-white/20 transition-all border border-white/10">
              <span className="material-symbols-outlined text-indigo-400">psychology</span>
              <span className="font-semibold">Multi-Agent Orchestration</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

function TutorialStep({ number, title, icon, children }: {
  number: number
  title: string
  icon: string
  children: React.ReactNode
}) {
  return (
    <Card className="p-8 border-slate-200 bg-white rounded-2xl shadow-sm">
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <span className="material-symbols-outlined text-3xl">{icon}</span>
          </div>
          <div className="mt-4 text-center">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 font-bold">
              {number}
            </span>
          </div>
        </div>
        <div className="flex-1 prose prose-slate max-w-none">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-0">{title}</h2>
          {children}
        </div>
      </div>
    </Card>
  )
}
