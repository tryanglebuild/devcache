'use client'

import { calculatePasswordStrength, type PasswordStrength as StrengthType } from '@/lib/auth/password-strength'

interface PasswordStrengthProps {
  password: string
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const { strength, score } = calculatePasswordStrength(password)

  const getStrengthColor = (strength: StrengthType) => {
    switch (strength) {
      case 'weak':
        return 'text-red-500'
      case 'medium':
        return 'text-amber-500'
      case 'strong':
        return 'text-emerald-500'
    }
  }

  const getStrengthLabel = (strength: StrengthType) => {
    switch (strength) {
      case 'weak':
        return 'Weak'
      case 'medium':
        return 'Medium'
      case 'strong':
        return 'Strong'
    }
  }

  if (!password) return null

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
          Security Strength
        </span>
        <span className={`text-[10px] uppercase font-bold tracking-widest ${getStrengthColor(strength)}`}>
          {getStrengthLabel(strength)}
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-200 rounded-full flex gap-1">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={`h-full w-1/3 rounded-full transition-all duration-300 ${
              index < score
                ? strength === 'weak'
                  ? 'bg-red-400'
                  : strength === 'medium'
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
                : 'bg-slate-100'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
