import { FavoritedItemsClient } from '@/components/dashboard/FavoritedItemsClient'
import { Star } from 'lucide-react'

export const dynamic = 'force-dynamic'

// FavoritesPage — renders the full favorites view.
// Data is fetched client-side inside FavoritedItemsClient via /api/dashboard/favorites.
export default async function FavoritesPage() {

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
            <Star className="h-5 w-5 text-white fill-white" />
          </div>
          <h1 className="text-3xl font-black text-[#191c1e] dark:text-on-surface tracking-tight">
            Favorites
          </h1>
        </div>
        <p className="text-[#464554] dark:text-on-surface-variant font-medium">
          Quick access to your starred projects and files
        </p>
      </div>

      {/* Favorites Grid — FavoritedItemsClient handles its own data fetching */}
      <FavoritedItemsClient />
    </div>
  )
}
