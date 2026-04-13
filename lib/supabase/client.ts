// Browser-side Supabase client factory.
// Creates a singleton client for use in Client Components and hooks.
// Auth state is managed via cookies shared with the server-side client.
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
