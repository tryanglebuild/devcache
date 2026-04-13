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
  Sparkles,
  Settings,
  FileText,
  ChevronDown,
  ChevronRight,
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

  const triggerBase =
    'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-[#464554] hover:bg-white hover:shadow-sm font-medium cursor-pointer'
  const triggerActive =
    'bg-gradient-to-br from-[#4f46e5] to-[#4338ca] text-white shadow-lg shadow-[#4f46e5]/30'
  const triggerInactive = ''

  const iconBase = 'w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0'

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-10 relative">
        <div className="absolute -left-4 top-0 w-1 h-16 bg-gradient-to-b from-[#4f46e5] to-[#4338ca] rounded-full" />
        <h1 className="text-4xl font-black text-[#191c1e] mb-3 tracking-tight">
          Account Settings
        </h1>
        <p className="text-base text-[#464554]">
          Manage your profile, security, and preferences
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="flex gap-8 w-full">
        {/* Left Sidebar */}
        <div className="w-56 shrink-0">
          <nav className="flex flex-col bg-gradient-to-br from-white to-[#f7f9fb] border border-[#c7c4d7]/20 p-3 rounded-2xl shadow-lg gap-2">

            {/* Profile */}
            <button
              onClick={() => selectTab('profile')}
              className={`${triggerBase} ${activeTab === 'profile' ? triggerActive : triggerInactive}`}
            >
              <div className={`${iconBase} ${activeTab === 'profile' ? 'bg-white/20' : 'bg-blue-50'}`}>
                <UserIcon className="h-4 w-4" />
              </div>
              <span className="font-semibold text-sm">Profile</span>
            </button>

            {/* Security */}
            <button
              onClick={() => selectTab('security')}
              className={`${triggerBase} ${activeTab === 'security' ? triggerActive : triggerInactive}`}
            >
              <div className={`${iconBase} ${activeTab === 'security' ? 'bg-white/20' : 'bg-emerald-50'}`}>
                <Shield className="h-4 w-4" />
              </div>
              <span className="font-semibold text-sm">Security</span>
            </button>

            {/* AI Group */}
            <div>
              {/* AI Parent Toggle */}
              <button
                onClick={() => {
                  const willExpand = !aiExpanded
                  setAiExpanded(willExpand)
                  if (willExpand && !isAiActive) {
                    setActiveTab('ai-model')
                  }
                }}
                className={`${triggerBase} justify-between ${isAiActive ? triggerActive : triggerInactive}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${iconBase} ${isAiActive ? 'bg-white/20' : 'bg-violet-50'}`}>
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-sm">AI</span>
                </div>
                {aiExpanded
                  ? <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  : <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-70" />
                }
              </button>

              {/* AI Sub-items */}
              {aiExpanded && (
                <div className="ml-4 mt-1 flex flex-col gap-1 border-l-2 border-[#e8eff3] pl-2">
                  <button
                    onClick={() => selectTab('ai-model')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all cursor-pointer text-sm font-medium
                      ${activeTab === 'ai-model'
                        ? 'bg-[#eef0ff] text-[#4f46e5] font-semibold'
                        : 'text-[#464554] hover:bg-white hover:shadow-sm'
                      }`}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors
                      ${activeTab === 'ai-model' ? 'bg-[#4f46e5]/10' : 'bg-[#f7f9fb]'}`}>
                      <Settings className="h-3.5 w-3.5" />
                    </div>
                    <span>Model</span>
                  </button>

                  <button
                    onClick={() => selectTab('ai-instructions')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all cursor-pointer text-sm font-medium
                      ${activeTab === 'ai-instructions'
                        ? 'bg-[#eef0ff] text-[#4f46e5] font-semibold'
                        : 'text-[#464554] hover:bg-white hover:shadow-sm'
                      }`}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors
                      ${activeTab === 'ai-instructions' ? 'bg-[#4f46e5]/10' : 'bg-[#f7f9fb]'}`}>
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <span>Instructions</span>
                  </button>

                  <button
                    onClick={() => selectTab('ai-usage')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all cursor-pointer text-sm font-medium
                      ${activeTab === 'ai-usage'
                        ? 'bg-[#eef0ff] text-[#4f46e5] font-semibold'
                        : 'text-[#464554] hover:bg-white hover:shadow-sm'
                      }`}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors
                      ${activeTab === 'ai-usage' ? 'bg-[#4f46e5]/10' : 'bg-[#f7f9fb]'}`}>
                      <BarChart3 className="h-3.5 w-3.5" />
                    </div>
                    <span>Usage</span>
                  </button>
                </div>
              )}
            </div>

            {/* Developer */}
            <button
              onClick={() => selectTab('developer')}
              className={`${triggerBase} ${activeTab === 'developer' ? triggerActive : triggerInactive}`}
            >
              <div className={`${iconBase} ${activeTab === 'developer' ? 'bg-white/20' : 'bg-slate-50'}`}>
                <Code2 className="h-4 w-4" />
              </div>
              <span className="font-semibold text-sm">Developer</span>
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
