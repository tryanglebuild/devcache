'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface FAQItem {
  question: string
  answer: string
  category: string
  tags: string[]
}

const faqData: FAQItem[] = [
  // Account & Billing
  {
    question: 'How do I create an account?',
    answer: 'Click "Get Started" in the navigation bar and sign up with your email or GitHub account. You\'ll receive a verification email to activate your account.',
    category: 'Account & Billing',
    tags: ['account', 'signup', 'registration', 'email', 'github']
  },
  {
    question: 'Is DevCache free to use?',
    answer: 'DevCache offers a free tier with access to core features. Premium plans unlock advanced capabilities like unlimited agents, priority support, and team collaboration.',
    category: 'Account & Billing',
    tags: ['pricing', 'free', 'premium', 'billing', 'subscription']
  },
  {
    question: 'How do I update my profile information?',
    answer: 'Navigate to Dashboard > Settings > Profile to update your name, bio, avatar, and social links.',
    category: 'Account & Billing',
    tags: ['profile', 'settings', 'avatar', 'bio']
  },
  {
    question: 'Can I delete my account?',
    answer: 'Yes, go to Dashboard > Settings > Security and click "Delete Account". This action is permanent and will remove all your data.',
    category: 'Account & Billing',
    tags: ['delete', 'account', 'remove', 'data']
  },
  
  // Agent Templates
  {
    question: 'What is an AI agent template?',
    answer: 'An agent template is a pre-configured AI assistant with specialized knowledge and capabilities. You can create custom agents for specific tasks like code review, documentation, or testing.',
    category: 'Agent Templates',
    tags: ['agent', 'template', 'ai', 'assistant', 'custom']
  },
  {
    question: 'How do I create a new agent?',
    answer: 'Go to Dashboard > My Templates and click "Create Agent". Define the agent\'s name, description, category, and content (instructions/rules). You can keep it private or publish to the marketplace.',
    category: 'Agent Templates',
    tags: ['create', 'agent', 'new', 'template']
  },
  {
    question: 'Can I edit an agent after publishing?',
    answer: 'Yes, you can edit your agents anytime. Updates will create a new version while maintaining the download count and ratings.',
    category: 'Agent Templates',
    tags: ['edit', 'update', 'version', 'publish']
  },
  {
    question: 'How do agent ratings work?',
    answer: 'Users can rate agents from 1-5 stars and leave reviews. The average rating is displayed on the agent card. High ratings increase visibility in the marketplace.',
    category: 'Agent Templates',
    tags: ['rating', 'review', 'stars', 'feedback']
  },
  {
    question: 'Can I delete an agent?',
    answer: 'Yes, click the delete icon on your agent card. Deleted agents move to the "Deleted" section where you can restore them within 30 days before permanent deletion.',
    category: 'Agent Templates',
    tags: ['delete', 'remove', 'restore', 'trash']
  },
  {
    question: 'How do I execute an agent?',
    answer: 'Open the agent details page and click "Execute Agent". Provide the required input context, and the agent will process your request and return results.',
    category: 'Agent Templates',
    tags: ['execute', 'run', 'use', 'agent']
  },
  
  // Projects & Files
  {
    question: 'How do I upload files to my projects?',
    answer: 'Navigate to Dashboard > Projects and click "Upload File" or drag and drop files directly. You can also create folders to organize your content.',
    category: 'Projects & Files',
    tags: ['upload', 'file', 'project', 'folder']
  },
  {
    question: 'What file types are supported?',
    answer: 'DevCache supports all text-based files including code files, markdown, JSON, YAML, and more. Binary files can be uploaded as attachments.',
    category: 'Projects & Files',
    tags: ['file', 'type', 'format', 'support']
  },
  {
    question: 'How does the search feature work?',
    answer: 'DevCache uses AI-powered semantic search with embeddings. It understands the meaning of your query and finds relevant content even if exact keywords don\'t match.',
    category: 'Projects & Files',
    tags: ['search', 'find', 'semantic', 'ai', 'embeddings']
  },
  {
    question: 'Can I organize files with tags?',
    answer: 'Yes! Create custom tags in Dashboard > Tags, then apply them to your files and folders. Tags help with filtering and organization.',
    category: 'Projects & Files',
    tags: ['tags', 'organize', 'filter', 'label']
  },
  {
    question: 'How do I create folders?',
    answer: 'In the Projects view, click "Create Folder" or use the quick action buttons in the sidebar. You can nest folders to create hierarchical structures.',
    category: 'Projects & Files',
    tags: ['folder', 'create', 'organize', 'structure']
  },
  {
    question: 'Can I upload entire folder structures?',
    answer: 'Yes! Use the "Upload Folder" option to upload complete directory structures while preserving the hierarchy.',
    category: 'Projects & Files',
    tags: ['folder', 'upload', 'bulk', 'structure']
  },
  
  // Marketplace
  {
    question: 'How do I download an agent from the marketplace?',
    answer: 'Browse the marketplace, click on an agent card to view details, then click "Add to Collection". The agent will be available in your dashboard.',
    category: 'Marketplace',
    tags: ['download', 'marketplace', 'agent', 'collection']
  },
  {
    question: 'What makes an agent trending?',
    answer: 'Trending agents are determined by recent download activity, ratings, and execution frequency. The algorithm prioritizes quality and community engagement.',
    category: 'Marketplace',
    tags: ['trending', 'popular', 'algorithm', 'ranking']
  },
  {
    question: 'Can I unpublish my agent?',
    answer: 'Yes, you can change visibility to "private" or delete the agent. Note that users who already downloaded it will retain their copy.',
    category: 'Marketplace',
    tags: ['unpublish', 'private', 'visibility', 'delete']
  },
  {
    question: 'How do I report inappropriate content?',
    answer: 'Click the flag icon on any agent card or contact support@devcache.com with the agent ID and reason for reporting.',
    category: 'Marketplace',
    tags: ['report', 'flag', 'inappropriate', 'abuse']
  },
  {
    question: 'Can I see who downloaded my agent?',
    answer: 'You can see the total download count and execution statistics in your agent stats, but individual user information is kept private for privacy reasons.',
    category: 'Marketplace',
    tags: ['downloads', 'stats', 'analytics', 'privacy']
  },
  
  // Chat & AI Assistant
  {
    question: 'How does the AI chat work?',
    answer: 'The chat assistant uses your project context, agent templates, and marketplace data to provide relevant answers. It can help you find templates, explain features, and guide you through tasks.',
    category: 'Chat & AI',
    tags: ['chat', 'ai', 'assistant', 'context']
  },
  {
    question: 'Can I choose different AI models?',
    answer: 'Yes! Click the model selector in the chat interface to choose from available models. Your preference is saved for future sessions.',
    category: 'Chat & AI',
    tags: ['model', 'chat', 'ai', 'selection']
  },
  {
    question: 'How is my chat data used?',
    answer: 'Chat messages are stored securely and used only to provide context for your conversations. We never share your data with third parties or use it for training without consent.',
    category: 'Chat & AI',
    tags: ['privacy', 'data', 'security', 'chat']
  },
  {
    question: 'Can I delete chat history?',
    answer: 'Yes, you can delete individual chat sessions from the chat sidebar. Click the delete icon next to any session to remove it permanently.',
    category: 'Chat & AI',
    tags: ['delete', 'chat', 'history', 'session']
  },
]

export function SearchableFAQ() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) return faqData

    const query = searchQuery.toLowerCase()
    return faqData.filter(faq => 
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query) ||
      faq.tags.some(tag => tag.includes(query)) ||
      faq.category.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const groupedFAQs = useMemo(() => {
    const groups: Record<string, FAQItem[]> = {}
    filteredFAQs.forEach(faq => {
      if (!groups[faq.category]) {
        groups[faq.category] = []
      }
      groups[faq.category].push(faq)
    })
    return groups
  }, [filteredFAQs])

  return (
    <div className="space-y-8">
      {/* Search Input */}
      <div className="relative max-w-2xl mx-auto">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          search
        </span>
        <Input
          type="text"
          placeholder="Search FAQ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 pr-4 py-6 text-base rounded-xl border-slate-200 bg-white"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        )}
      </div>

      {/* Results Count */}
      {searchQuery && (
        <p className="text-center text-sm text-slate-600">
          Found {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* FAQ Groups */}
      {Object.keys(groupedFAQs).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedFAQs).map(([category, faqs]) => (
            <Card key={category} className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-indigo-600 text-xl">help</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{category}</h3>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-b border-slate-200 last:border-0">
                    <AccordionTrigger className="text-left hover:no-underline py-4">
                      <span className="text-lg font-bold text-slate-900 pr-4">
                        {faq.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 leading-relaxed pb-4 pt-2">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center bg-white rounded-2xl border-slate-200">
          <span className="material-symbols-outlined text-slate-300 text-6xl mb-4 inline-block">
            search_off
          </span>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No results found</h3>
          <p className="text-slate-600">
            Try different keywords or browse all categories
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-500 transition-all"
          >
            Clear Search
          </button>
        </Card>
      )}
    </div>
  )
}
