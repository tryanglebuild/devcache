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
            <DialogHeader className="pb-0">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                <DialogTitle className="text-sm font-semibold text-neutral-900">
                  Delete Account
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-neutral-500 mt-1">
                This action is permanent and cannot be undone
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-3 bg-red-50 border border-red-100 rounded-md">
                <p className="text-xs font-medium text-red-700">The following data will be permanently deleted:</p>
                <ul className="mt-2 space-y-1">
                  {[
                    'All your AI agent templates and configurations',
                    'All your projects and project items',
                    'All your chat sessions and message history',
                    'Your profile information and preferences',
                    'All your collections and favorites',
                    'Your account and authentication data',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-red-600">
                      <span className="mt-1 shrink-0">–</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-start gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-md">
                <Checkbox
                  id="understood"
                  checked={understood}
                  onCheckedChange={(checked) => setUnderstood(checked as boolean)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="understood"
                  className="text-xs text-neutral-700 cursor-pointer leading-relaxed"
                >
                  I understand that this action is permanent and cannot be undone. All my data will be permanently deleted.
                </label>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleWarningNext}
                disabled={!understood}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 2: Credentials */}
        {step === 'credentials' && (
          <>
            <DialogHeader className="pb-0">
              <div className="flex items-center gap-2.5">
                <KeyRound className="h-4 w-4 text-neutral-400 shrink-0" />
                <DialogTitle className="text-sm font-semibold text-neutral-900">
                  Verify Your Identity
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-neutral-500 mt-1">
                Step 2 of 3 — Enter your credentials to continue
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <p className="text-xs text-neutral-500">
                Enter your email and password to verify your identity before proceeding.
              </p>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-neutral-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={userEmail}
                    className="border-neutral-200 text-sm"
                    disabled={isDeleting}
                  />
                  <p className="text-[11px] text-neutral-400">
                    Must match: {userEmail}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-medium text-neutral-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="border-neutral-200 text-sm"
                    disabled={isDeleting}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep('warning')} disabled={isDeleting}>
                Back
              </Button>
              <Button
                size="sm"
                onClick={handleCredentialsNext}
                disabled={isDeleting || !email || !password}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? (
                  <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Verifying...</>
                ) : (
                  <>Verify & Continue<ArrowRight className="ml-2 h-3.5 w-3.5" /></>
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 3: Final Confirmation */}
        {step === 'final-confirmation' && (
          <>
            <DialogHeader className="pb-0">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
                <DialogTitle className="text-sm font-semibold text-neutral-900">
                  Final Confirmation
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-neutral-500 mt-1">
                Step 3 of 3 — Last chance to cancel
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md space-y-1.5">
                <p className="text-xs font-medium text-neutral-700">
                  Type <span className="font-mono text-red-600">DELETE MY ACCOUNT</span> to confirm:
                </p>
                <Input
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  className="border-neutral-200 font-mono text-sm"
                  disabled={isDeleting}
                />
              </div>

              <div className="space-y-1.5 text-xs text-neutral-400">
                <p className="flex items-center gap-2">– Your account will be deleted immediately</p>
                <p className="flex items-center gap-2">– All your data will be permanently removed</p>
                <p className="flex items-center gap-2">– This action cannot be undone or reversed</p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep('credentials')} disabled={isDeleting}>
                Back
              </Button>
              <Button
                size="sm"
                onClick={handleFinalDelete}
                disabled={isDeleting || confirmationText !== 'DELETE MY ACCOUNT'}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? (
                  <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Deleting...</>
                ) : (
                  <>Delete Account<Trash2 className="ml-2 h-3.5 w-3.5" /></>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
