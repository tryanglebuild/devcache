// Scheduled cron edge function: permanently deletes soft-deleted agent templates.
// Templates are first soft-deleted (is_deleted=true) giving users a grace period to restore.
// This function runs periodically and hard-deletes rows that have expired the grace period.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  try {
    // Verify cron secret for security
    const authHeader = req.headers.get('Authorization')
    if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Call cleanup function
    const { data, error } = await supabase.rpc('cleanup_deleted_templates')

    if (error) {
      console.error('Cleanup error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const deletedCount = data || 0
    console.log(`Cleanup completed: ${deletedCount} templates permanently deleted`)

    return new Response(
      JSON.stringify({
        success: true,
        deleted_count: deletedCount,
        message: `Successfully deleted ${deletedCount} expired templates`
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
