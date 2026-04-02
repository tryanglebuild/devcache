-- Create helper functions for skills system

-- ============================================
-- Function: get_active_user_skills
-- Returns all active skills for a user ordered by priority
-- ============================================

CREATE OR REPLACE FUNCTION get_active_user_skills(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  file_path TEXT,
  priority INTEGER,
  category TEXT,
  content TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.id,
    us.name,
    us.description,
    us.file_path,
    us.priority,
    us.category,
    NULL::TEXT as content -- Content will be loaded from Storage
  FROM user_skills us
  WHERE us.user_id = p_user_id
    AND us.is_active = true
  ORDER BY us.priority DESC, us.created_at ASC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================
-- Function: mark_skill_as_used
-- Updates last_used_at when skill is applied in chat
-- ============================================

CREATE OR REPLACE FUNCTION mark_skill_as_used(p_skill_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_skills
  SET last_used_at = NOW()
  WHERE id = p_skill_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Trigger: update_user_skills_updated_at
-- Auto-updates updated_at timestamp on changes
-- ============================================

CREATE OR REPLACE FUNCTION update_user_skills_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_skills_updated_at
  BEFORE UPDATE ON user_skills
  FOR EACH ROW
  EXECUTE FUNCTION update_user_skills_updated_at();

-- Add comments for documentation
COMMENT ON FUNCTION get_active_user_skills IS 'Retrieves all active skills for a user ordered by priority';
COMMENT ON FUNCTION mark_skill_as_used IS 'Updates last_used_at timestamp when skill is applied in chat';
COMMENT ON FUNCTION update_user_skills_updated_at IS 'Trigger function to auto-update updated_at timestamp';
