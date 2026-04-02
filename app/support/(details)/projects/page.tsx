import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Project Management Guide | DevCache Support',
  description: 'Master project organization, tags, and smart search in DevCache',
}

export default function ProjectsGuidePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-8">
          <Link href="/support" className="hover:text-indigo-600">Support</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-slate-900 font-semibold">Project Management</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 border rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider mb-4">
            Intermediate Guide
          </Badge>
          <h1 className="text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Advanced Project Organization
          </h1>
          <p className="text-xl text-slate-600">
            Master tags, collections, and AI-powered search to organize your development resources
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          <Section
            title="Understanding Project Structure"
            icon="account_tree"
          >
            <p>DevCache uses a hierarchical folder structure similar to your file system:</p>
            <ul>
              <li><strong>Folders</strong>: Organize related files and sub-folders</li>
              <li><strong>Files</strong>: Store code snippets, documentation, or any text content</li>
              <li><strong>Attachments</strong>: Upload binary files (images, PDFs) linked to items</li>
            </ul>
            
            <Card className="bg-slate-900 text-slate-100 p-6 rounded-xl my-6">
              <div className="text-sm font-mono space-y-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-yellow-400 text-sm">folder</span>
                  <span>My Projects</span>
                </div>
                <div className="flex items-center gap-2 ml-6">
                  <span className="material-symbols-outlined text-yellow-400 text-sm">folder</span>
                  <span>React Components</span>
                </div>
                <div className="flex items-center gap-2 ml-12">
                  <span className="material-symbols-outlined text-blue-400 text-sm">description</span>
                  <span>Button.tsx</span>
                </div>
                <div className="flex items-center gap-2 ml-12">
                  <span className="material-symbols-outlined text-blue-400 text-sm">description</span>
                  <span>Modal.tsx</span>
                </div>
                <div className="flex items-center gap-2 ml-6">
                  <span className="material-symbols-outlined text-yellow-400 text-sm">folder</span>
                  <span>API Utilities</span>
                </div>
                <div className="flex items-center gap-2 ml-12">
                  <span className="material-symbols-outlined text-blue-400 text-sm">description</span>
                  <span>fetch-helper.ts</span>
                </div>
              </div>
            </Card>
          </Section>

          <Section
            title="Creating and Managing Tags"
            icon="label"
          >
            <p>Tags are powerful organizational tools that work across your entire workspace:</p>
            
            <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">Creating Tags</h3>
            <ol>
              <li>Navigate to <strong>Dashboard → Tags</strong></li>
              <li>Click <strong>&quot;Create Tag&quot;</strong></li>
              <li>Choose a name, color, and optional description</li>
              <li>Save and start applying to your content</li>
            </ol>

            <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">Tag Best Practices</h3>
            <ul>
              <li><strong>Use consistent naming</strong>: Lowercase, hyphenated (e.g., &quot;react-hooks&quot;, &quot;api-design&quot;)</li>
              <li><strong>Create hierarchies</strong>: Use prefixes for related tags (&quot;lang-typescript&quot;, &quot;lang-python&quot;)</li>
              <li><strong>Limit tag count</strong>: 3-5 tags per item is optimal</li>
              <li><strong>Color coding</strong>: Use colors to represent categories (blue for languages, green for frameworks)</li>
            </ul>

            <Card className="bg-amber-50 border-amber-200 p-6 rounded-xl mt-6">
              <p className="text-amber-900 flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-600 flex-shrink-0">tips_and_updates</span>
                <span><strong>Pro tip</strong>: Tags are automatically indexed for AI search. Well-tagged content appears more frequently in chat results.</span>
              </p>
            </Card>
          </Section>

          <Section
            title="Smart Search & Embeddings"
            icon="search"
          >
            <p>DevCache uses AI embeddings to understand the semantic meaning of your content:</p>

            <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">How It Works</h3>
            <ol>
              <li><strong>Automatic Indexing</strong>: When you create or update content, DevCache generates embeddings</li>
              <li><strong>Semantic Understanding</strong>: The AI understands concepts, not just keywords</li>
              <li><strong>Context-Aware Results</strong>: Search results consider your entire workspace</li>
            </ol>

            <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">Search Tips</h3>
            <ul>
              <li><strong>Natural language</strong>: Ask questions like &quot;How do I handle authentication?&quot;</li>
              <li><strong>Describe concepts</strong>: &quot;React component for data tables&quot; finds relevant code</li>
              <li><strong>Use the chat</strong>: The AI assistant provides better context than keyword search</li>
            </ul>
          </Section>

          <Section
            title="Favorites & Quick Access"
            icon="star"
          >
            <p>Mark frequently used items as favorites for quick access:</p>
            <ul>
              <li>Click the star icon on any file or folder</li>
              <li>Access favorites from <strong>Dashboard → Favorites</strong></li>
              <li>Favorites appear at the top of search results</li>
            </ul>
          </Section>

          <Section
            title="File Uploads & Attachments"
            icon="upload_file"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-3">Uploading Files</h3>
            <p>Multiple ways to add content:</p>
            <ul>
              <li><strong>Single file</strong>: Click &quot;Upload File&quot; and select a file</li>
              <li><strong>Drag & drop</strong>: Drag files directly into the project view</li>
              <li><strong>Folder upload</strong>: Upload entire folder structures at once</li>
              <li><strong>Create inline</strong>: Click &quot;Create File&quot; to write content directly</li>
            </ul>

            <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">Supported Content</h3>
            <ul>
              <li><strong>Text files</strong>: Fully indexed and searchable (code, markdown, JSON, etc.)</li>
              <li><strong>Binary files</strong>: Stored as attachments with metadata</li>
              <li><strong>Language detection</strong>: Automatic syntax highlighting and language tags</li>
            </ul>
          </Section>

          <Section
            title="Activity Tracking"
            icon="history"
          >
            <p>DevCache automatically tracks your activity:</p>
            <ul>
              <li>Recent file views and edits</li>
              <li>Agent executions</li>
              <li>Downloads from marketplace</li>
              <li>Tag usage analytics</li>
            </ul>
            <p>View your activity log in the dashboard to see what you&apos;ve been working on.</p>
          </Section>
        </div>

        {/* Related Resources */}
        <Card className="bg-white border-slate-200 p-10 rounded-2xl mt-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/support/quick-start" className="flex flex-col items-center gap-2 p-6 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all text-center">
              <span className="material-symbols-outlined text-indigo-600 text-3xl">rocket_launch</span>
              <span className="font-semibold text-slate-900">Quick Start</span>
            </Link>
            <Link href="/support/first-agent" className="flex flex-col items-center gap-2 p-6 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all text-center">
              <span className="material-symbols-outlined text-indigo-600 text-3xl">smart_toy</span>
              <span className="font-semibold text-slate-900">First Agent</span>
            </Link>
            <Link href="/support" className="flex flex-col items-center gap-2 p-6 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all text-center">
              <span className="material-symbols-outlined text-indigo-600 text-3xl">help</span>
              <span className="font-semibold text-slate-900">All Guides</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

function Section({ title, icon, children }: {
  title: string
  icon: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
      </div>
      <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
        {children}
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
