import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FileViewClient } from '@/components/projects/FileViewClient'

export default async function FileViewPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get the file item
  const { data: file, error: fileError } = await supabase
    .from('project_items')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('type', 'file')
    .single()

  if (fileError || !file) {
    redirect('/dashboard/projects')
  }

  // Get attachments
  const { data: attachments } = await supabase
    .from('project_file_attachments')
    .select('*')
    .eq('project_item_id', file.id)
    .order('created_at', { ascending: false })

  return (
    <FileViewClient 
      file={file} 
      attachments={attachments || []} 
    />
  )
}
