'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { User, Mail, Briefcase, Calendar } from 'lucide-react'

interface ProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  displayName: string
  email: string
  jobTitle: string
  createdAt?: string
}

export function ProfileModal({
  open,
  onOpenChange,
  displayName,
  email,
  jobTitle,
  createdAt,
}: ProfileModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-surface-container border border-[#c7c4d7]/20 dark:border-white/[0.09]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-[#191c1e] dark:text-on-surface">
            Profile Information
          </DialogTitle>
          <DialogDescription className="text-[#464554] dark:text-on-surface-variant">
            View and manage your account details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile Avatar */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-[#4f46e5]/20 dark:border-[#7c7ff5]/20 bg-gradient-to-br from-[#4f46e5] to-[#4338ca] flex items-center justify-center text-white font-black text-3xl shadow-lg">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            {/* Name */}
            <div className="flex items-start gap-3 p-4 bg-[#f7f9fb] dark:bg-surface-container-low rounded-lg border border-[#c7c4d7]/10 dark:border-white/[0.06]">
              <div className="w-10 h-10 rounded-lg bg-white dark:bg-surface-container border border-[#c7c4d7]/20 dark:border-white/[0.09] flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-[#4f46e5] dark:text-[#7c7ff5]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-[#464554] dark:text-on-surface-variant mb-1">
                  Full Name
                </p>
                <p className="text-sm font-bold text-[#191c1e] dark:text-on-surface">
                  {displayName}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3 p-4 bg-[#f7f9fb] dark:bg-surface-container-low rounded-lg border border-[#c7c4d7]/10 dark:border-white/[0.06]">
              <div className="w-10 h-10 rounded-lg bg-white dark:bg-surface-container border border-[#c7c4d7]/20 dark:border-white/[0.09] flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-[#4f46e5] dark:text-[#7c7ff5]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-[#464554] dark:text-on-surface-variant mb-1">
                  Email Address
                </p>
                <p className="text-sm font-bold text-[#191c1e] dark:text-on-surface truncate">
                  {email}
                </p>
              </div>
            </div>

            {/* Job Title */}
            <div className="flex items-start gap-3 p-4 bg-[#f7f9fb] dark:bg-surface-container-low rounded-lg border border-[#c7c4d7]/10 dark:border-white/[0.06]">
              <div className="w-10 h-10 rounded-lg bg-white dark:bg-surface-container border border-[#c7c4d7]/20 dark:border-white/[0.09] flex items-center justify-center shrink-0">
                <Briefcase className="h-5 w-5 text-[#4f46e5] dark:text-[#7c7ff5]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-[#464554] dark:text-on-surface-variant mb-1">
                  Job Title
                </p>
                <p className="text-sm font-bold text-[#191c1e] dark:text-on-surface">
                  {jobTitle}
                </p>
              </div>
            </div>

            {/* Member Since */}
            {createdAt && (
              <div className="flex items-start gap-3 p-4 bg-[#f7f9fb] dark:bg-surface-container-low rounded-lg border border-[#c7c4d7]/10 dark:border-white/[0.06]">
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-surface-container border border-[#c7c4d7]/20 dark:border-white/[0.09] flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-[#4f46e5] dark:text-[#7c7ff5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-[#464554] dark:text-on-surface-variant mb-1">
                    Member Since
                  </p>
                  <p className="text-sm font-bold text-[#191c1e] dark:text-on-surface">
                    {new Date(createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Edit Profile Button */}
          <button className="w-full py-3 px-4 bg-gradient-to-br from-[#4f46e5] to-[#4338ca] text-white rounded-lg font-bold text-sm shadow-lg shadow-[#4f46e5]/20 dark:shadow-[#7c7ff5]/10 hover:shadow-xl transition-all">
            Edit Profile
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
