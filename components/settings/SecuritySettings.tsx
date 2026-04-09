'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
      <Card className="bg-gradient-to-br from-white to-blue-50/30 border-[#c7c4d7]/20 shadow-xl">
        <CardHeader className="pb-6 border-b border-[#c7c4d7]/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Link2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-[#191c1e]">Linked Accounts</CardTitle>
              <CardDescription className="text-[#464554] text-sm">
                Manage your login methods and connected accounts
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <LinkedAccountsManager />
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="bg-gradient-to-br from-white to-emerald-50/30 border-[#c7c4d7]/20 shadow-xl">
        <CardHeader className="pb-6 border-b border-[#c7c4d7]/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-[#191c1e]">Change Password</CardTitle>
              <CardDescription className="text-[#464554] text-sm">
                Update your password to keep your account secure
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password" className="text-sm font-semibold text-[#191c1e]">
                Current Password
              </Label>
              <Input
                id="current_password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
                className="border-[#c7c4d7]/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password" className="text-sm font-semibold text-[#191c1e]">
                New Password
              </Label>
              <Input
                id="new_password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                minLength={8}
                className="border-[#c7c4d7]/20"
              />
              <p className="text-xs text-[#464554]">
                Must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password" className="text-sm font-semibold text-[#191c1e]">
                Confirm New Password
              </Label>
              <Input
                id="confirm_password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
                className="border-[#c7c4d7]/20"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isChangingPassword}
                className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:scale-105 transition-all px-8"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Change Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="bg-gradient-to-br from-white to-indigo-50/30 border-[#c7c4d7]/20 shadow-xl">
        <CardHeader className="pb-6 border-b border-[#c7c4d7]/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <UserIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-[#191c1e]">Account Information</CardTitle>
              <CardDescription className="text-[#464554] text-sm">
                View your account details
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-start gap-3 p-5 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
              <span className="text-gray-600 font-mono font-bold text-xs">#</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Account ID
              </p>
              <p className="text-sm font-mono text-[#191c1e] break-all">
                {user.id}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-5 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-gray-500 text-xl">calendar_today</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Member Since
              </p>
              <p className="text-sm font-bold text-[#191c1e]">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-5 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-gray-500 text-xl">schedule</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Last Sign In
              </p>
              <p className="text-sm font-bold text-[#191c1e]">
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Never'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-gradient-to-br from-white to-red-50/40 border-red-200 shadow-xl">
        <CardHeader className="pb-6 border-b border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-red-600">
                Danger Zone
              </CardTitle>
              <CardDescription className="text-[#464554] text-sm">
                Irreversible actions that affect your account
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              Deleting your account will permanently remove all your data, including templates, projects, and chat history. This action cannot be undone.
            </AlertDescription>
          </Alert>
          <Button
            variant="destructive"
            className="font-bold"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Delete Account
          </Button>
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
