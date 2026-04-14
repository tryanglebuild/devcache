'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, Lock, AlertTriangle, User as UserIcon, Link2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import LinkedAccountsManager from '@/components/auth/LinkedAccountsManager'
import { DeleteAccountDialog } from '@/components/settings/DeleteAccountDialog'
import { useSearchParams } from 'next/navigation'

interface SecuritySettingsProps {
  user: SupabaseUser
}

export function SecuritySettings({ user }: SecuritySettingsProps) {
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const searchParams = useSearchParams()

  // Check for error messages from OAuth callback
  useEffect(() => {
    const error = searchParams.get('error')
    const message = searchParams.get('message')
    
    if (error && message) {
      // Show toast based on error type
      if (error === 'identity_exists') {
        toast.error(message, { duration: 6000, id: 'identity-exists' })
      } else if (error === 'linking_disabled') {
        toast.error(message, { duration: 6000, id: 'linking-disabled' })
      } else {
        toast.error(message, { duration: 5000, id: 'oauth-error' })
      }
      
      // Clean up URL parameters after showing toast
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }
  }, [searchParams])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setIsChangingPassword(true)

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to change password')
      }

      toast.success('Password changed successfully')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Linked Accounts */}
      <Card className="bg-white dark:bg-surface-container border-neutral-200 dark:border-white/[0.09] shadow-none">
        <CardHeader className="pb-4 border-b border-neutral-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-neutral-400 dark:text-on-surface-variant" />
            <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-on-surface">Linked Accounts</CardTitle>
          </div>
          <CardDescription className="text-sm text-neutral-500 dark:text-on-surface-variant">
            Manage your login methods and connected accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <LinkedAccountsManager />
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="bg-white dark:bg-surface-container border-neutral-200 dark:border-white/[0.09] shadow-none">
        <CardHeader className="pb-4 border-b border-neutral-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-neutral-400 dark:text-on-surface-variant" />
            <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-on-surface">Change Password</CardTitle>
          </div>
          <CardDescription className="text-sm text-neutral-500 dark:text-on-surface-variant">
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current_password" className="text-sm font-medium text-neutral-700 dark:text-on-surface-variant">
                Current Password
              </Label>
              <Input
                id="current_password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
                className="border-neutral-200 dark:border-white/[0.09] text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new_password" className="text-sm font-medium text-neutral-700 dark:text-on-surface-variant">
                New Password
              </Label>
              <Input
                id="new_password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                minLength={8}
                className="border-neutral-200 dark:border-white/[0.09] text-sm"
              />
              <p className="text-xs text-neutral-400 dark:text-on-surface-variant/60">
                Must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm_password" className="text-sm font-medium text-neutral-700 dark:text-on-surface-variant">
                Confirm New Password
              </Label>
              <Input
                id="confirm_password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
                className="border-neutral-200 dark:border-white/[0.09] text-sm"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                size="sm"
                disabled={isChangingPassword}
                className="bg-neutral-900 hover:bg-neutral-700 text-white"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Changing...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-3.5 w-3.5" />
                    Change Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="bg-white dark:bg-surface-container border-neutral-200 dark:border-white/[0.09] shadow-none">
        <CardHeader className="pb-4 border-b border-neutral-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-neutral-400 dark:text-on-surface-variant" />
            <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-on-surface">Account Information</CardTitle>
          </div>
          <CardDescription className="text-sm text-neutral-500 dark:text-on-surface-variant">
            View your account details
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-3">
          <div className="flex items-center justify-between py-2.5 border-b border-neutral-100 dark:border-white/[0.06]">
            <span className="text-sm text-neutral-500 dark:text-on-surface-variant">Account ID</span>
            <span className="text-sm font-mono text-neutral-900 dark:text-on-surface truncate max-w-xs">
              {user.id}
            </span>
          </div>

          <div className="flex items-center justify-between py-2.5 border-b border-neutral-100 dark:border-white/[0.06]">
            <span className="text-sm text-neutral-500 dark:text-on-surface-variant">Member Since</span>
            <span className="text-sm text-neutral-900 dark:text-on-surface">
              {new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-neutral-500 dark:text-on-surface-variant">Last Sign In</span>
            <span className="text-sm text-neutral-900 dark:text-on-surface">
              {user.last_sign_in_at
                ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Never'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-white dark:bg-surface-container border-red-200 dark:border-red-900/40 shadow-none">
        <CardHeader className="pb-4 border-b border-red-100 dark:border-red-900/30">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <CardTitle className="text-sm font-semibold text-red-600">Danger Zone</CardTitle>
          </div>
          <CardDescription className="text-sm text-neutral-500 dark:text-on-surface-variant">
            Irreversible actions that permanently affect your account
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-on-surface">Delete Account</p>
              <p className="text-sm text-neutral-500 dark:text-on-surface-variant mt-0.5">
                Permanently remove your account and all associated data including templates, projects, and chat history.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Dialog */}
      <DeleteAccountDialog
        userEmail={user.email || ''}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  )
}
