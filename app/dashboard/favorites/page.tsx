import { createClient } from '@/lib/supabase/server'
import { FavoritedItemsClient } from '@/components/dashboard/FavoritedItemsClient'
import { Star } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function FavoritesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch favorite items
  const { data: favoriteItems } = await supabase
    .from('project_items')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_favorite', true)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
            <Star className="h-5 w-5 text-white fill-white" />
          </div>
          <h1 className="text-3xl font-black text-[#191c1e] tracking-tight">
            Favorites
          </h1>
        </div>
        <p className="text-[#464554] font-medium">
          Quick access to your starred projects and files
        </p>
      </div>

      {/* Favorites Grid */}
      <FavoritedItemsClient items={favoriteItems || []} />
    </div>
  )
}
