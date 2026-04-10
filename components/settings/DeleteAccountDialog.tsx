'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertTriangle, Loader2, Trash2, KeyRound, ArrowRight, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface DeleteAccountDialogProps {
  userEmail: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = 'warning' | 'credentials' | 'final-confirmation'

export function DeleteAccountDialog({ userEmail, open, onOpenChange }: DeleteAccountDialogProps) {
  const [step, setStep] = useState<Step>('warning')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmationText, setConfirmationText] = useState('')
  const [understood, setUnderstood] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const resetDialog = () => {
    setStep('warning')
    setEmail('')
    setPassword('')
    setConfirmationText('')
    setUnderstood(false)
    setIsDeleting(false)
  }

  const handleClose = () => {
    if (!isDeleting) {
      resetDialog()
      onOpenChange(false)
    }
  }

  const handleWarningNext = () => {
    if (!understood) {
      toast.error('Please confirm that you understand the consequences')
      return
    }
    setStep('credentials')
  }

  const handleCredentialsNext = async () => {
    if (!email || !password) {
      toast.error('Please enter your email and password')
      return
    }

    if (email !== userEmail) {
      toast.error('Email does not match your account email')
      return
    }

    // Verify credentials before proceeding
    setIsDeleting(true)
    try {
      const response = await fetch('/api/user/verify-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Invalid credentials')
      }

      setStep('final-confirmation')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid credentials')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleFinalDelete = async () => {
    if (confirmationText !== 'DELETE MY ACCOUNT') {
      toast.error('Please type "DELETE MY ACCOUNT" to confirm')
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete account')
      }

      toast.success('Account deleted successfully')
      
      // Redirect to landing page after short delay
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 1000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete account')
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {/* Step 1: Warning */}
        {step === 'warning' && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black text-red-600 dark:text-red-400">
                    Delete Account
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    This action cannot be undone
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert variant="destructive" className="border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10">
                <AlertTriangle className="h-5 w-5" />
                <AlertDescription className="ml-2">
                  <strong className="font-bold">Warning:</strong> Deleting your account will permanently remove all your data.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm">
                <p className="font-semibold text-[#191c1e] dark:text-on-surface">The following data will be permanently deleted:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span className="text-[#464554] dark:text-on-surface-variant">All your AI agent templates and configurations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span className="text-[#464554] dark:text-on-surface-variant">All your projects and project items</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span className="text-[#464554] dark:text-on-surface-variant">All your chat sessions and message history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span className="text-[#464554] dark:text-on-surface-variant">Your profile information and preferences</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span className="text-[#464554] dark:text-on-surface-variant">All your collections and favorites</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span className="text-[#464554] dark:text-on-surface-variant">Your account and authentication data</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-start gap-3 p-4 bg-[#f2f4f6] dark:bg-white/5 rounded-lg border border-[#e5e7eb] dark:border-white/[0.09]">
                <Checkbox
                  id="understood"
                  checked={understood}
                  onCheckedChange={(checked) => setUnderstood(checked as boolean)}
                  className="mt-1"
                />
                <label
                  htmlFor="understood"
                  className="text-sm font-medium text-[#191c1e] dark:text-on-surface cursor-pointer leading-relaxed"
                >
                  I understand that this action is permanent and cannot be undone. All my data will be permanently deleted.
                </label>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="font-semibold"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleWarningNext}
                disabled={!understood}
                className="font-bold"
              >
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 2: Credentials */}
        {step === 'credentials' && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                  <KeyRound className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    Verify Your Identity
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    Step 2 of 3: Enter your credentials
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert className="border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10">
                <AlertDescription className="text-amber-900 dark:text-amber-200">
                  Please enter your email and password to verify your identity before proceeding.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-[#191c1e] dark:text-on-surface">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={userEmail}
                    className="border-slate-300"
                    disabled={isDeleting}
                  />
                  <p className="text-xs text-[#464554] dark:text-on-surface-variant">
                    Must match your account email: {userEmail}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-[#191c1e] dark:text-on-surface">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="border-slate-300"
                    disabled={isDeleting}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setStep('warning')}
                disabled={isDeleting}
                className="font-semibold"
              >
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleCredentialsNext}
                disabled={isDeleting || !email || !password}
                className="font-bold"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 3: Final Confirmation */}
        {step === 'final-confirmation' && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-500/15 flex items-center justify-center">
                  <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" strokeWidth={2} />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black text-red-600 dark:text-red-400">
                    Final Confirmation
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    Step 3 of 3: Last chance to cancel
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert variant="destructive" className="border-red-400 dark:border-red-500/30 bg-red-100 dark:bg-red-500/10">
                <AlertTriangle className="h-5 w-5" />
                <AlertDescription className="ml-2">
                  <strong className="font-bold">FINAL WARNING:</strong> This is your last chance to cancel. Once you proceed, your account and all associated data will be permanently deleted.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 p-4 bg-[#f2f4f6] dark:bg-white/5 rounded-lg border-2 border-red-200 dark:border-red-500/30">
                <p className="text-sm font-semibold text-[#191c1e] dark:text-on-surface">
                  Type <span className="font-mono font-bold text-red-600">DELETE MY ACCOUNT</span> to confirm:
                </p>
                <Input
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  className="border-red-300 font-mono"
                  disabled={isDeleting}
                />
              </div>

              <div className="space-y-2 text-xs text-[#464554] dark:text-on-surface-variant">
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Your account will be deleted immediately
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  All your data will be permanently removed
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  This action cannot be undone or reversed
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setStep('credentials')}
                disabled={isDeleting}
                className="font-semibold"
              >
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleFinalDelete}
                disabled={isDeleting || confirmationText !== 'DELETE MY ACCOUNT'}
                className="font-bold bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting Account...
                  </>
                ) : (
                  <>
                    Delete My Account Forever
                    <Trash2 className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
