'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Tables } from '@/types/database.types'
import { Plus, Folder, FileText, Star } from 'lucide-react'
import { CreateItemModal } from './CreateItemModal'
import { ItemCard } from './ItemCard'
import { FolderUploadButton } from './FolderUploadButton'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

type ProjectItem = Tables<'project_items'>

interface ProjectsClientProps {
  initialItems: ProjectItem[]
  initialTotal: number
}

const ITEMS_PER_PAGE = 16

export function ProjectsClient({ initialItems, initialTotal }: ProjectsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [items, setItems] = useState<ProjectItem[]>(initialItems)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createType, setCreateType] = useState<'folder' | 'file'>('folder')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(initialTotal)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  // Check URL parameters on mount to auto-open create modal
  useEffect(() => {
    const createParam = searchParams.get('create')
    if (createParam === 'folder' || createParam === 'file') {
      setCreateType(createParam)
      setIsCreateDialogOpen(true)
      // Clean up URL
      router.replace('/dashboard/projects', { scroll: false })
    }
  }, [searchParams, router])

  const handleOpenFolder = (folder: ProjectItem) => {
    router.push(`/dashboard/projects/${folder.id}`)
  }

  const handleItemCreated = (newItem: ProjectItem) => {
    setItems([newItem, ...items])
    setTotalItems(prev => prev + 1)
  }

  const handleItemUpdated = (updatedItem: ProjectItem) => {
    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item))
  }

  const handleItemDeleted = (deletedId: string) => {
    setItems(items.filter(item => item.id !== deletedId))
    setTotalItems(prev => prev - 1)
  }

  const handleFolderUploadComplete = (newItems: ProjectItem[]) => {
    setItems([...items, ...newItems])
    setTotalItems(prev => prev + newItems.length)
  }

  // Load page data
  const loadPage = async (page: number) => {
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const start = (page - 1) * ITEMS_PER_PAGE
      const end = start + ITEMS_PER_PAGE - 1

      const { data: newItems, count } = await supabase
        .from('project_items')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .is('parent_id', null)
        .order('type', { ascending: false })
        .order('name', { ascending: true })
        .range(start, end)

      if (newItems) {
        setItems(newItems)
      }
      if (count !== null) {
        setTotalItems(count)
      }
    } catch (error) {
      console.error('Load page error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    loadPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Use root items only
  const displayItems = items.filter(item => item.parent_id === null)
  const folders = displayItems.filter(item => item.type === 'folder')
  const files = displayItems.filter(item => item.type === 'file')

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('ellipsis')
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="space-y-6 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-[#191c1e] dark:text-on-surface mb-2">
            Projects
          </h2>
          <p className="text-[#464554] dark:text-on-surface-variant font-medium">
            Organize your development resources with folders and markdown files
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setCreateType('folder')
              setIsCreateDialogOpen(true)
            }}
            className="px-4 py-2.5 bg-white dark:bg-surface-container border border-[#c7c4d7]/30 dark:border-white/[0.09] text-[#191c1e] dark:text-on-surface rounded-lg font-bold text-sm hover:bg-[#f2f4f6] dark:hover:bg-surface-container-high transition-all flex items-center gap-2"
          >
            <Folder className="h-4 w-4" />
            New Folder
          </button>
          <button
            onClick={() => {
              setCreateType('file')
              setIsCreateDialogOpen(true)
            }}
            className="px-4 py-2.5 bg-white dark:bg-surface-container border border-[#c7c4d7]/30 dark:border-white/[0.09] text-[#191c1e] dark:text-on-surface rounded-lg font-bold text-sm hover:bg-[#f2f4f6] dark:hover:bg-surface-container-high transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New File
          </button>
          <FolderUploadButton
            parentId={null}
            onUploadComplete={handleFolderUploadComplete}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-surface-container p-4 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] dark:shadow-none dark:border dark:border-white/[0.06] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#4f46e5]/10 flex items-center justify-center text-[#4f46e5] dark:text-[#7c7ff5]">
            <Folder className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#464554] dark:text-on-surface-variant uppercase tracking-widest">Folders</p>
            <p className="text-xl font-black text-[#191c1e] dark:text-on-surface">{folders.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-container p-4 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] dark:shadow-none dark:border dark:border-white/[0.06] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#575992]/10 flex items-center justify-center text-[#575992] dark:text-[#7c7ff5]">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#464554] dark:text-on-surface-variant uppercase tracking-widest">Files</p>
            <p className="text-xl font-black text-[#191c1e] dark:text-on-surface">{files.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-container p-4 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] dark:shadow-none dark:border dark:border-white/[0.06] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#904900]/10 flex items-center justify-center text-[#904900]">
            <Star className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#464554] dark:text-on-surface-variant uppercase tracking-widest">Favorites</p>
            <p className="text-xl font-black text-[#191c1e] dark:text-on-surface">
              {items.filter(item => item.is_favorite).length}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {totalItems === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-surface-container rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] dark:shadow-none dark:border dark:border-white/[0.06]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f2f4f6] dark:bg-surface-container-high flex items-center justify-center">
            <Folder className="h-8 w-8 text-[#464554] dark:text-on-surface-variant" />
          </div>
          <p className="text-[#464554] dark:text-on-surface-variant font-medium mb-4">
            No projects yet
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setCreateType('folder')
                setIsCreateDialogOpen(true)
              }}
              className="px-4 py-2 bg-white dark:bg-surface-container-high border border-[#c7c4d7]/30 dark:border-white/[0.09] text-[#191c1e] dark:text-on-surface rounded-lg font-semibold text-sm hover:bg-[#f2f4f6] dark:hover:bg-surface-container-highest transition-all"
            >
              Create Folder
            </button>
            <button
              onClick={() => {
                setCreateType('file')
                setIsCreateDialogOpen(true)
              }}
              className="px-4 py-2 bg-gradient-to-br from-[#4f46e5] to-[#4338ca] text-white rounded-lg font-semibold text-sm shadow-lg shadow-[#4f46e5]/20 hover:shadow-xl transition-all"
            >
              Create File
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-xl">
              <div className="text-[#464554] text-sm font-medium">Loading...</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative">
            {folders.map(folder => (
              <ItemCard
                key={folder.id}
                item={folder}
                onOpen={() => handleOpenFolder(folder)}
                onUpdate={handleItemUpdated}
                onDelete={handleItemDeleted}
              />
            ))}
            {files.map(file => (
              <ItemCard
                key={file.id}
                item={file}
                onUpdate={handleItemUpdated}
                onDelete={handleItemDeleted}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>

                  {getPageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                      {page === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      <CreateItemModal
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        type={createType}
        parentId={null}
        onItemCreated={handleItemCreated}
      />
    </div>
  )
}
