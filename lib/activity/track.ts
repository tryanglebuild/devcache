import { createClient } from '@/lib/supabase/client'

export type ActivityAction = 'view' | 'edit' | 'create' | 'delete'

export async function trackActivity(
  projectItemId: string,
  action: ActivityAction = 'view'
): Promise<void> {
  try {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.warn('No user found, skipping activity tracking')
      return
    }

    const { data, error } = await supabase.from('activity_log').insert({
      user_id: user.id,
      project_item_id: projectItemId,
      action_type: action,
    })

    if (error) {
      console.error('Activity tracking error:', error)
    } else {
      console.log('Activity tracked successfully:', { projectItemId, action })
    }
  } catch (error) {
    console.error('Failed to track activity:', error)
  }
}
