'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, User as UserIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileSettingsProps {
  user: SupabaseUser
  profile: Profile | null
}

export function ProfileSettings({ user, profile }: ProfileSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    job_title: profile?.job_title || '',
    company: profile?.company || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
    website: profile?.website || '',
    github_username: profile?.github_username || '',
    twitter_username: profile?.twitter_username || '',
    linkedin_url: profile?.linkedin_url || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update profile')
      }

      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-white to-blue-50/30 border-[#c7c4d7]/20 shadow-xl">
      <CardHeader className="pb-6 border-b border-[#c7c4d7]/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <UserIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black text-[#191c1e]">Profile Information</CardTitle>
            <CardDescription className="text-[#464554] text-sm">
              Update your personal information and public profile
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-[#191c1e]">
              Email Address
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-3 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="pl-14 bg-gradient-to-r from-[#f7f9fb] to-blue-50/50 border-[#c7c4d7]/20 font-medium"
              />
            </div>
            <p className="text-xs text-[#464554] flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-blue-500" />
              Email cannot be changed here. Use Security tab to request email change.
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-sm font-semibold text-[#191c1e]">
              Full Name
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="John Doe"
              className="border-[#c7c4d7]/20"
            />
          </div>

          {/* Job Title & Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job_title" className="text-sm font-semibold text-[#191c1e]">
                Job Title
              </Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                placeholder="Software Engineer"
                className="border-[#c7c4d7]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-semibold text-[#191c1e]">
                Company
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Acme Inc"
                className="border-[#c7c4d7]/20"
              />
            </div>
          </div>

          {/* Location & Website */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-semibold text-[#191c1e]">
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="San Francisco, CA"
                className="border-[#c7c4d7]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-semibold text-[#191c1e]">
                Website
              </Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
                className="border-[#c7c4d7]/20"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-semibold text-[#191c1e]">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={4}
              className="border-[#c7c4d7]/20 resize-none"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 pb-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c7c4d7]/30 to-transparent" />
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-[#c7c4d7]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4648d4]" />
                <h3 className="text-xs font-bold text-[#191c1e] uppercase tracking-wider">
                  Social Links
                </h3>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c7c4d7]/30 to-transparent" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="github_username" className="text-sm font-semibold text-[#191c1e]">
                GitHub Username
              </Label>
              <Input
                id="github_username"
                value={formData.github_username}
                onChange={(e) => setFormData({ ...formData, github_username: e.target.value })}
                placeholder="octocat"
                className="border-[#c7c4d7]/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter_username" className="text-sm font-semibold text-[#191c1e]">
                Twitter Username
              </Label>
              <Input
                id="twitter_username"
                value={formData.twitter_username}
                onChange={(e) => setFormData({ ...formData, twitter_username: e.target.value })}
                placeholder="username"
                className="border-[#c7c4d7]/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_url" className="text-sm font-semibold text-[#191c1e]">
                LinkedIn URL
              </Label>
              <Input
                id="linkedin_url"
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="border-[#c7c4d7]/20"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-[#c7c4d7]/10">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-br from-[#4648d4] to-[#6063ee] text-white font-bold shadow-lg shadow-[#4648d4]/30 hover:shadow-xl hover:scale-105 transition-all px-8 py-2.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg mr-2">check_circle</span>
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
