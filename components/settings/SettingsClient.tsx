'use client'

import { useState } from 'react'
import { ProfileSettings } from './ProfileSettings'
import { SecuritySettings } from './SecuritySettings'
import { PreferencesSettings } from './PreferencesSettings'
import { InstructionsSettings } from './InstructionsSettings'
import { UsageSettings } from './UsageSettings'
import { DevSettings } from './DevSettings'
import {
  User as UserIcon,
  Shield,
  BarChart3,
  Code2,
  Settings,
  FileText,
  ChevronDown,
  ChevronRight,
  Bot,
} from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Preferences = Database['public']['Tables']['user_model_preferences']['Row']

type Tab = 'profile' | 'security' | 'ai-model' | 'ai-instructions' | 'ai-usage' | 'developer'

interface SettingsClientProps {
  user: SupabaseUser
  profile: Profile | null
  preferences: Preferences | null
}

const AI_TABS: Tab[] = ['ai-model', 'ai-instructions', 'ai-usage']

export function SettingsClient({ user, profile, preferences }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [aiExpanded, setAiExpanded] = useState(false)

  const isAiActive = AI_TABS.includes(activeTab)

  function selectTab(tab: Tab) {
    setActiveTab(tab)
    if (AI_TABS.includes(tab)) {
      setAiExpanded(true)
    }
  }

  const navItem =
    'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer text-left'
  const navActive = 'bg-neutral-100 text-neutral-900'
  const navInactive = 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'

  return (
    <div className="px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage your profile, security, and preferences
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="flex gap-10 w-full">
        {/* Left Sidebar */}
        <div className="w-52 shrink-0">
          <nav className="flex flex-col gap-0.5">
            {/* Profile */}
            <button
              onClick={() => selectTab('profile')}
              className={`${navItem} ${activeTab === 'profile' ? navActive : navInactive}`}
            >
              <UserIcon className="h-4 w-4 shrink-0" />
              Profile
            </button>

            {/* Security */}
            <button
              onClick={() => selectTab('security')}
              className={`${navItem} ${activeTab === 'security' ? navActive : navInactive}`}
            >
              <Shield className="h-4 w-4 shrink-0" />
              Security
            </button>

            {/* AI Group */}
            <div>
              <button
                onClick={() => {
                  const willExpand = !aiExpanded
                  setAiExpanded(willExpand)
                  if (willExpand && !isAiActive) {
                    setActiveTab('ai-model')
                  }
                }}
                className={`${navItem} justify-between ${isAiActive ? navActive : navInactive}`}
              >
                <span className="flex items-center gap-2.5">
                  <Bot className="h-4 w-4 shrink-0" />
                  AI
                </span>
                {aiExpanded
                  ? <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                  : <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                }
              </button>

              {aiExpanded && (
                <div className="ml-6 mt-0.5 flex flex-col gap-0.5 border-l border-neutral-200 pl-3">
                  <button
                    onClick={() => selectTab('ai-model')}
                    className={`${navItem} ${activeTab === 'ai-model' ? navActive : navInactive}`}
                  >
                    <Settings className="h-3.5 w-3.5 shrink-0" />
                    Model
                  </button>

                  <button
                    onClick={() => selectTab('ai-instructions')}
                    className={`${navItem} ${activeTab === 'ai-instructions' ? navActive : navInactive}`}
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    Instructions
                  </button>

                  <button
                    onClick={() => selectTab('ai-usage')}
                    className={`${navItem} ${activeTab === 'ai-usage' ? navActive : navInactive}`}
                  >
                    <BarChart3 className="h-3.5 w-3.5 shrink-0" />
                    Usage
                  </button>
                </div>
              )}
            </div>

            {/* Developer */}
            <button
              onClick={() => selectTab('developer')}
              className={`${navItem} ${activeTab === 'developer' ? navActive : navInactive}`}
            >
              <Code2 className="h-4 w-4 shrink-0" />
              Developer
            </button>
          </nav>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && <ProfileSettings user={user} profile={profile} />}
          {activeTab === 'security' && <SecuritySettings user={user} />}
          {activeTab === 'ai-model' && <PreferencesSettings preferences={preferences} userId={user.id} />}
          {activeTab === 'ai-instructions' && <InstructionsSettings />}
          {activeTab === 'ai-usage' && <UsageSettings />}
          {activeTab === 'developer' && <DevSettings />}
        </div>
      </div>
    </div>
  )
}
