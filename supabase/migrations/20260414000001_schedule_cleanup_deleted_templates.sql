-- Schedules the cleanup-deleted-templates Edge Function to run daily via pg_cron + pg_net.
-- The Edge Function permanently hard-deletes agent_templates rows that have been
-- soft-deleted (deleted_at IS NOT NULL) for more than 30 days.
--
-- Uses the public anon key (not a secret) + verify_jwt on the Edge Function side.
-- pg_net must be enabled: Dashboard -> Database -> Extensions -> pg_net

-- ============================================
-- Enable pg_net for HTTP calls from pg_cron
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ============================================
-- Schedule daily cron job
-- Runs every day at midnight UTC
-- ============================================
SELECT cron.schedule(
  'daily-cleanup-deleted-templates',       -- Job name
  '0 0 * * *',                             -- Cron expression: Every day at 00:00 UTC
  $$
  SELECT net.http_post(
    url := 'https://qeplvargpuusbrzwfluw.supabase.co/functions/v1/cleanup-deleted-templates',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcGx2YXJncHV1c2JyendmbHV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MTY5NTksImV4cCI6MjA5MDA5Mjk1OX0.75E00sD0-D_3LzPPEpP9xnEasqxOoiQ8ouUBkjBWfxk'
    ),
    body := '{}'::jsonb
  );
  $$
);
