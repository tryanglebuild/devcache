export type PasswordStrength = 'weak' | 'medium' | 'strong'

export interface PasswordStrengthResult {
  strength: PasswordStrength
  score: number // 0-3
  feedback: string[]
}

export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  let score = 0
  const feedback: string[] = []

  if (!password) {
    return { strength: 'weak', score: 0, feedback: ['Password is required'] }
  }

  // Length check
  if (password.length >= 8) score++
  else feedback.push('At least 8 characters')

  if (password.length >= 12) score++

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++
  } else {
    feedback.push('Mix of uppercase and lowercase')
  }

  if (/\d/.test(password)) {
    score++
  } else {
    feedback.push('Include numbers')
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score++
  } else {
    feedback.push('Include special characters')
  }

  // Determine strength
  let strength: PasswordStrength
  if (score <= 2) {
    strength = 'weak'
  } else if (score <= 4) {
    strength = 'medium'
  } else {
    strength = 'strong'
  }

  return { strength, score: Math.min(score, 3), feedback }
}
