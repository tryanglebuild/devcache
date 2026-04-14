import { FavoritedItemsClient } from '@/components/dashboard/FavoritedItemsClient'

export const dynamic = 'force-dynamic'

export default async function FavoritesPage() {
  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
          Favorites
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Quick access to your starred projects and files.
        </p>
      </div>

      <FavoritedItemsClient />
    </div>
  )
}
