/**
 * Account Linking Utilities
 * 
 * Handles linking multiple authentication providers (email, Google, GitHub)
 * to a single user account based on email address.
 */

import { createClient } from '@/lib/supabase/server'

export interface AccountLinkingResult {
  success: boolean
  message: string
  userId?: string
  linkedProviders?: string[]
}

/**
 * Check if an email already exists in the system
 * Returns the user_id if found, null otherwise
 */
export async function findUserByEmail(email: string): Promise<string | null> {
  const supabase = await createClient()
  
  try {
    // Query auth.users table to find user by email
    const { data, error } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single()
    
    if (error || !data) {
      return null
    }
    
    return data.id
  } catch (error) {
    console.error('Error finding user by email:', error)
    return null
  }
}

/**
 * Get all authentication providers linked to a user
 */
export async function getUserProviders(userId: string): Promise<string[]> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('auth.identities')
      .select('provider')
      .eq('user_id', userId)
    
    if (error || !data) {
      return []
    }
    
    return data.map(identity => identity.provider)
  } catch (error) {
    console.error('Error getting user providers:', error)
    return []
  }
}

/**
 * Check if a user has a specific provider linked
 */
export async function hasProvider(userId: string, provider: string): Promise<boolean> {
  const providers = await getUserProviders(userId)
  return providers.includes(provider)
}

/**
 * Get account linking status for a user
 */
export async function getAccountLinkingStatus(email: string) {
  const userId = await findUserByEmail(email)
  
  if (!userId) {
    return {
      exists: false,
      userId: null,
      providers: [],
      canLink: false,
    }
  }
  
  const providers = await getUserProviders(userId)
  
  return {
    exists: true,
    userId,
    providers,
    canLink: true,
    hasEmailPassword: providers.includes('email'),
    hasGoogle: providers.includes('google'),
    hasGitHub: providers.includes('github'),
  }
}
