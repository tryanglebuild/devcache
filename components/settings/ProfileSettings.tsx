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
      {/* Profile Header */}
      <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-neutral-200 flex items-center justify-center shrink-0">
            <span className="text-xl font-semibold text-neutral-600">
              {formData.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              {formData.full_name || 'Your Name'}
            </h2>
            <p className="text-sm text-neutral-500">
              {formData.job_title || 'Add your job title'}
              {formData.company && ` · ${formData.company}`}
            </p>
          </div>
        </div>

        {!isEditing && (
          <Button
            onClick={handleEdit}
            variant="outline"
            size="sm"
            className="gap-2 text-sm"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </Button>
        )}
      </div>

      {/* Profile Form */}
      <Card className="bg-white border-neutral-200 shadow-none">
        <CardHeader className="pb-4 border-b border-neutral-100">
          <CardTitle className="text-sm font-semibold text-neutral-900">Personal Information</CardTitle>
          <CardDescription className="text-sm text-neutral-500">
            {isEditing ? 'Update your personal details' : 'Your personal details and contact information'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email (Read-only) */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-neutral-400" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-neutral-50 border-neutral-200 text-neutral-500 text-sm"
              />
              <p className="text-xs text-neutral-400">
                Email cannot be changed here. Use the Security tab to request an email change.
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="full_name" className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
                <UserIcon className="h-3.5 w-3.5 text-neutral-400" />
                Full Name
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="John Doe"
                className="border-neutral-200 text-sm"
                disabled={!isEditing}
              />
            </div>

            {/* Job Title & Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="job_title" className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-neutral-400" />
                  Job Title
                </Label>
                <Input
                  id="job_title"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  placeholder="Software Engineer"
                  className="border-neutral-200 text-sm"
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company" className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-neutral-400" />
                  Company
                </Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Acme Inc"
                  className="border-neutral-200 text-sm"
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Location & Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="San Francisco, CA"
                  className="border-neutral-200 text-sm"
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website" className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-neutral-400" />
                  Website
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                  className="border-neutral-200 text-sm"
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-sm font-medium text-neutral-700">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="A short description about yourself"
                rows={3}
                className="border-neutral-200 text-sm resize-none"
                disabled={!isEditing}
              />
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100">
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="gap-1.5"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading}
                  className="gap-1.5 bg-neutral-900 hover:bg-neutral-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
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
      <Card className="bg-white border-neutral-200 shadow-none">
        <CardHeader className="pb-4 border-b border-neutral-100">
          <CardTitle className="text-sm font-semibold text-neutral-900">Social Links</CardTitle>
          <CardDescription className="text-sm text-neutral-500">
            Connect your social media profiles
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="github_username" className="text-sm font-medium text-neutral-700">
                GitHub Username
              </Label>
              <Input
                id="github_username"
                value={formData.github_username}
                onChange={(e) => setFormData({ ...formData, github_username: e.target.value })}
                placeholder="octocat"
                className="border-neutral-200 text-sm"
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="twitter_username" className="text-sm font-medium text-neutral-700">
                Twitter Username
              </Label>
              <Input
                id="twitter_username"
                value={formData.twitter_username}
                onChange={(e) => setFormData({ ...formData, twitter_username: e.target.value })}
                placeholder="username"
                className="border-neutral-200 text-sm"
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="linkedin_url" className="text-sm font-medium text-neutral-700">
                LinkedIn URL
              </Label>
              <Input
                id="linkedin_url"
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="border-neutral-200 text-sm"
                disabled={!isEditing}
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
