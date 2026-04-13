-- Creates the Postgres RPC function called by the cleanup-deleted-templates Edge Function.
-- Permanently deletes agent_templates rows that have been soft-deleted (deleted_at IS NOT NULL)
-- for longer than the grace period (30 days).
-- Cascading FK constraints automatically remove related agent_template_embeddings rows.

CREATE OR REPLACE FUNCTION cleanup_deleted_templates()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM agent_templates
  WHERE deleted_at IS NOT NULL
    AND deleted_at < now() - interval '30 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Only the service role (used by the Edge Function) can call this.
REVOKE ALL ON FUNCTION cleanup_deleted_templates() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION cleanup_deleted_templates() TO service_role;
  