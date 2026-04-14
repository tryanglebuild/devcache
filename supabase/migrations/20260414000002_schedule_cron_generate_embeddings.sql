-- Schedules the cron-generate-embeddings Edge Function to run weekly via pg_cron + pg_net.
-- Processes any agent templates or project items with no embedding vector (embedding_vector IS NULL).
-- Replaces the broken schedule from 20260406000001 which used app.settings.* that were never set.

SELECT cron.schedule(
  'weekly-embedding-check',
  '0 2 * * 0',   -- Every Sunday at 2 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://qeplvargpuusbrzwfluw.supabase.co/functions/v1/cron-generate-embeddings',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcGx2YXJncHV1c2JyendmbHV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MTY5NTksImV4cCI6MjA5MDA5Mjk1OX0.75E00sD0-D_3LzPPEpP9xnEasqxOoiQ8ouUBkjBWfxk'
    ),
    body := jsonb_build_object(
      'scheduled', true,
      'max_items', 100
    )
  );
  $$
);
