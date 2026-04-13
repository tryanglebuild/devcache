// DevCache CLI — Product Configuration
//
// These are the PUBLIC credentials for the DevCache Supabase project.
// The anon key is intentionally public (same as NEXT_PUBLIC_SUPABASE_ANON_KEY
// in the web app) — it is safe to ship in a CLI package because all data access
// is protected by Row Level Security policies on the database.
//
// If these values ever need to be rotated, change them here only.

export const DEVCACHE_SUPABASE_URL = 'https://qeplvargpuusbrzwfluw.supabase.co';

export const DEVCACHE_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcGx2YXJncHV1c2JyendmbHV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MTY5NTksImV4cCI6MjA5MDA5Mjk1OX0.' +
  '75E00sD0-D_3LzPPEpP9xnEasqxOoiQ8ouUBkjBWfxk';
