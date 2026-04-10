'use client'

import { useState, FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { validateSignupForm, type SignupFormData, type ValidationErrors } from '@/lib/auth/validation'
import PasswordStrength from './PasswordStrength'
import { useRouter } from 'next/navigation'

export default function SignupForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError(null)

    // Validate form
    const validationErrors = validateSignupForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const supabase = createClient()

      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setServerError(error.message)
        return
      }

      if (data.user) {
        router.push('/dashboard')
      }
    } catch (error) {
      setServerError('An unexpected error occurred. Please try again.')
      console.error('Signup error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof SignupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
          {serverError}
        </div>
      )}

      {/* Full Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1 dark:text-on-surface-variant"
        >
          Full Name
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Linus Torvalds"
          className={`w-full bg-white border ${
            errors.name ? 'border-red-300 dark:border-red-500/30' : 'border-slate-200 dark:border-white/[0.09]'
          } focus:border-[#494bd6] focus:ring-4 focus:ring-[#494bd6]/10 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-300 transition-all outline-none dark:bg-surface-container dark:focus:border-[#7c7ff5] dark:focus:ring-[#7c7ff5]/10 dark:text-on-surface dark:placeholder-on-surface-variant/50`}
        />
        {errors.name && (
          <p className="text-red-600 text-xs mt-1 ml-1 dark:text-red-400">{errors.name}</p>
        )}
      </div>

      {/* Work Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1 dark:text-on-surface-variant"
        >
          Work Email
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="name@company.com"
          className={`w-full bg-white border ${
            errors.email ? 'border-red-300 dark:border-red-500/30' : 'border-slate-200 dark:border-white/[0.09]'
          } focus:border-[#494bd6] focus:ring-4 focus:ring-[#494bd6]/10 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-300 transition-all outline-none dark:bg-surface-container dark:focus:border-[#7c7ff5] dark:focus:ring-[#7c7ff5]/10 dark:text-on-surface dark:placeholder-on-surface-variant/50`}
        />
        {errors.email && (
          <p className="text-red-600 text-xs mt-1 ml-1 dark:text-red-400">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1 dark:text-on-surface-variant"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="••••••••"
            className={`w-full bg-white border ${
              errors.password ? 'border-red-300 dark:border-red-500/30' : 'border-slate-200 dark:border-white/[0.09]'
            } focus:border-[#494bd6] focus:ring-4 focus:ring-[#494bd6]/10 rounded-xl py-3 px-4 pr-12 text-slate-900 placeholder-slate-300 transition-all outline-none dark:bg-surface-container dark:focus:border-[#7c7ff5] dark:focus:ring-[#7c7ff5]/10 dark:text-on-surface dark:placeholder-on-surface-variant/50`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors dark:text-on-surface-variant dark:hover:text-on-surface"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <span className="material-symbols-outlined text-xl">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
        {errors.password && (
          <p className="text-red-600 text-xs mt-1 ml-1 dark:text-red-400">{errors.password}</p>
        )}
        <PasswordStrength password={formData.password} />
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#494bd6] hover:bg-[#2f2ebe] text-white font-bold py-4 px-4 rounded-xl shadow-xl shadow-[#494bd6]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-[#7c7ff5] dark:hover:bg-[#9b9df7] dark:text-[#0d1121] dark:shadow-[#7c7ff5]/10"
        >
          <span>{isLoading ? 'Creating Account...' : 'Create My Account'}</span>
          {!isLoading && (
            <span className="material-symbols-outlined text-xl">arrow_right_alt</span>
          )}
        </button>
      </div>
    </form>
  )
}
