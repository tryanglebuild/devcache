'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, User as UserIcon, Edit2, X, Check, MapPin, Briefcase, Building2, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileSettingsProps {
  user: SupabaseUser
  profile: Profile | null
}

export function ProfileSettings({ user, profile }: ProfileSettingsProps) {
  const [isEditing, setIsEditing] = useState(false)
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

  // Store original data for cancel functionality
  const [originalData, setOriginalData] = useState(formData)

  const handleEdit = () => {
    setOriginalData(formData) // Save current state before editing
    setIsEditing(true)
  }

  const handleCancel = () => {
    setFormData(originalData) // Restore original data
    setIsEditing(false)
  }

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
      setOriginalData(formData) // Update original data after successful save
      setIsEditing(false)
      
      // Refresh the page to update navbar
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <Card className="bg-white border-[#e8eff3] shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-br from-[#4f46e5] to-[#6366f1]" />
        <CardContent className="pt-0 pb-6">
          <div className="flex items-end justify-between -mt-12 mb-6">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#4f46e5] to-[#6366f1] flex items-center justify-center shadow-xl border-4 border-white">
                <span className="text-3xl font-black text-white">
                  {formData.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="pb-2">
                <h2 className="text-2xl font-black text-[#191c1e] tracking-tight">
                  {formData.full_name || 'Your Name'}
                </h2>
                <p className="text-sm text-[#464554] font-medium">
                  {formData.job_title || 'Add your job title'}
                  {formData.company && ` at ${formData.company}`}
                </p>
              </div>
            </div>
            
            {!isEditing && (
              <Button
                onClick={handleEdit}
                className="gap-2 bg-gradient-to-br from-[#4f46e5] to-[#6366f1] text-white font-semibold shadow-md shadow-[#4f46e5]/20 hover:shadow-lg hover:scale-105 transition-all border-0"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
          
          {formData.bio && (
            <p className="text-sm text-[#464554] leading-relaxed max-w-2xl">
              {formData.bio}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card className="bg-white border-[#e8eff3] shadow-sm">
        <CardHeader className="border-b border-[#e8eff3]">
          <CardTitle className="text-lg font-bold text-[#191c1e]">Personal Information</CardTitle>
          <CardDescription className="text-sm text-[#464554]">
            {isEditing ? 'Update your personal details' : 'Your personal details and contact information'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-[#191c1e] flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#4f46e5]" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-[#f7f9fb] border-[#e8eff3] font-medium text-[#464554]"
              />
              <p className="text-xs text-[#6b7280] flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#4f46e5]" />
                Email cannot be changed here. Use Security tab to request email change.
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-sm font-semibold text-[#191c1e] flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-[#4f46e5]" />
                Full Name
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="John Doe"
                className="border-[#e8eff3] focus:border-[#4f46e5] focus:ring-[#4f46e5]"
                disabled={!isEditing}
              />
            </div>

            {/* Job Title & Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job_title" className="text-sm font-semibold text-[#191c1e] flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-[#4f46e5]" />
                  Job Title
                </Label>
                <Input
                  id="job_title"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  placeholder="Software Engineer"
                  className="border-[#e8eff3] focus:border-[#4f46e5] focus:ring-[#4f46e5]"
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-semibold text-[#191c1e] flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[#4f46e5]" />
                  Company
                </Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Acme Inc"
                  className="border-[#e8eff3] focus:border-[#4f46e5] focus:ring-[#4f46e5]"
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Location & Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-semibold text-[#191c1e] flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#4f46e5]" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="San Francisco, CA"
                  className="border-[#e8eff3] focus:border-[#4f46e5] focus:ring-[#4f46e5]"
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm font-semibold text-[#191c1e] flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[#4f46e5]" />
                  Website
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                  className="border-[#e8eff3] focus:border-[#4f46e5] focus:ring-[#4f46e5]"
                  disabled={!isEditing}
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
                className="border-[#e8eff3] focus:border-[#4f46e5] focus:ring-[#4f46e5] resize-none"
                disabled={!isEditing}
              />
            </div>

            {/* Action Buttons - Only show when editing */}
            {isEditing && (
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e8eff3]">
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant="outline"
                  disabled={isLoading}
                  className="gap-2 border-[#e8eff3] text-[#464554] hover:bg-[#f7f9fb]"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-br from-[#4f46e5] to-[#6366f1] text-white font-semibold shadow-md shadow-[#4f46e5]/20 hover:shadow-lg hover:scale-105 transition-all px-6 gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Social Links Card */}
      <Card className="bg-white border-[#e8eff3] shadow-sm">
        <CardHeader className="border-b border-[#e8eff3]">
          <CardTitle className="text-lg font-bold text-[#191c1e]">Social Links</CardTitle>
          <CardDescription className="text-sm text-[#464554]">
            Connect your social media profiles
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="github_username" className="text-sm font-semibold text-[#191c1e]">
                GitHub Username
              </Label>
              <Input
                id="github_username"
                value={formData.github_username}
                onChange={(e) => setFormData({ ...formData, github_username: e.target.value })}
                placeholder="octocat"
                className="border-[#e8eff3] focus:border-[#4f46e5] focus:ring-[#4f46e5]"
                disabled={!isEditing}
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
                className="border-[#e8eff3] focus:border-[#4f46e5] focus:ring-[#4f46e5]"
                disabled={!isEditing}
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
                className="border-[#e8eff3] focus:border-[#4f46e5] focus:ring-[#4f46e5]"
                disabled={!isEditing}
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
