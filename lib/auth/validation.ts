export interface SignupFormData {
  name: string
  email: string
  password: string
}

export interface ValidationErrors {
  name?: string
  email?: string
  password?: string
}

export function validateSignupForm(data: SignupFormData): ValidationErrors {
  const errors: ValidationErrors = {}

  // Name validation
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
  }
  if (data.name && /[^a-zA-Z\s'-]/.test(data.name)) {
    errors.name = 'Name contains invalid characters'
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!data.email || !emailRegex.test(data.email)) {
    errors.email = 'Please enter a valid email address'
  }

  // Password validation
  if (!data.password || data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  }

  return errors
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
