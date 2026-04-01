'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileSettings } from './ProfileSettings'
import { SecuritySettings } from './SecuritySettings'
import { PreferencesSettings } from './PreferencesSettings'
import { User as UserIcon, Shield, Settings } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Preferences = Database['public']['Tables']['user_model_preferences']['Row']

interface SettingsClientProps {
  user: SupabaseUser
  profile: Profile | null
  preferences: Preferences | null
}

export function SettingsClient({ user, profile, preferences }: SettingsClientProps) {
  return (
    <div className="p-8">
      {/* Header with gradient accent */}
      <div className="mb-10 relative">
        <div className="absolute -left-4 top-0 w-1 h-16 bg-gradient-to-b from-[#4648d4] to-[#6063ee] rounded-full" />
        <h1 className="text-4xl font-black text-[#191c1e] mb-3 tracking-tight">
          Account Settings
        </h1>
        <p className="text-base text-[#464554]">
          Manage your profile, security, and preferences
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="flex gap-8">
        {/* Left Sidebar - Vertical Tabs */}
        <Tabs defaultValue="profile" orientation="vertical" className="flex gap-8 w-full">
          <div className="w-56 shrink-0">
            <TabsList className="flex flex-col h-fit w-full bg-gradient-to-br from-white to-[#f7f9fb] border border-[#c7c4d7]/20 p-3 rounded-2xl shadow-lg gap-2">
              <TabsTrigger 
                value="profile"
                className="w-full justify-start gap-3 px-4 py-3.5 rounded-xl data-active:bg-gradient-to-br data-active:from-[#4648d4] data-active:to-[#6063ee] data-active:text-white data-active:shadow-lg data-active:shadow-[#4648d4]/30 transition-all text-[#464554] hover:bg-white hover:shadow-sm font-medium"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 data-active:bg-white/20 flex items-center justify-center transition-colors">
                  <UserIcon className="h-4 w-4" />
                </div>
                <span className="font-semibold text-sm">Profile</span>
              </TabsTrigger>
              <TabsTrigger 
                value="security"
                className="w-full justify-start gap-3 px-4 py-3.5 rounded-xl data-active:bg-gradient-to-br data-active:from-[#4648d4] data-active:to-[#6063ee] data-active:text-white data-active:shadow-lg data-active:shadow-[#4648d4]/30 transition-all text-[#464554] hover:bg-white hover:shadow-sm font-medium"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 data-active:bg-white/20 flex items-center justify-center transition-colors">
                  <Shield className="h-4 w-4" />
                </div>
                <span className="font-semibold text-sm">Security</span>
              </TabsTrigger>
              <TabsTrigger 
                value="preferences"
                className="w-full justify-start gap-3 px-4 py-3.5 rounded-xl data-active:bg-gradient-to-br data-active:from-[#4648d4] data-active:to-[#6063ee] data-active:text-white data-active:shadow-lg data-active:shadow-[#4648d4]/30 transition-all text-[#464554] hover:bg-white hover:shadow-sm font-medium"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-50 data-active:bg-white/20 flex items-center justify-center transition-colors">
                  <Settings className="h-4 w-4" />
                </div>
                <span className="font-semibold text-sm">Preferences</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            <TabsContent value="profile" className="mt-0">
              <ProfileSettings user={user} profile={profile} />
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <SecuritySettings user={user} />
            </TabsContent>

            <TabsContent value="preferences" className="mt-0">
              <PreferencesSettings preferences={preferences} userId={user.id} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
