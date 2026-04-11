'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tables } from '@/types/database.types'
import { Plus, Folder, FileText, Star, Edit, Trash2, Upload } from 'lucide-react'
import { CreateItemModal } from './CreateItemModal'
import { EditItemModal } from './EditItemModal'
import { PublishToMarketplaceModal } from './PublishToMarketplaceModal'
import { ItemCard } from './ItemCard'
import { Breadcrumb } from './Breadcrumb'
import { FolderUploadButton } from './FolderUploadButton'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { createClient } from '@/lib/supabase/client'
import { trackActivity } from '@/lib/activity/track'
import toast from 'react-hot-toast'

type ProjectItem = Tables<'project_items'>

const ITEMS_PER_PAGE = 16

interface ProjectDetailClientProps {
  project: ProjectItem
  initialItems: ProjectItem[]
  initialTotal: number
}

export function ProjectDetailClient({ project, initialItems, initialTotal }: ProjectDetailClientProps) {
  const router = useRouter()
  const [items, setItems] = useState<ProjectItem[]>(initialItems)
  const [totalItems, setTotalItems] = useState(initialTotal)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoadingPage, setIsLoadingPage] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [createType, setCreateType] = useState<'folder' | 'file'>('folder')
  const [breadcrumbPath, setBreadcrumbPath] = useState<ProjectItem[]>([])
  const [tagColors, setTagColors] = useState<Record<string, string>>({})

  const supabase = createClient()
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  // Track view activity when folder is opened
  useEffect(() => {
    trackActivity(project.id, 'view')
  }, [project.id])

  // Load tag colors
  useEffect(() => {
    const loadTagColors = async () => {
      if (!project.language_tags || project.language_tags.length === 0) return

      const { data, error } = await supabase
        .from('user_tags')
        .select('name, color')
        .in('name', project.language_tags)

      if (!error && data) {
        const colors: Record<string, string> = {}
        data.forEach(tag => {
          colors[tag.name] = tag.color
        })
        setTagColors(colors)
      }
    }

    loadTagColors()
  }, [project.language_tags, supabase])

  // Load breadcrumb path
  useEffect(() => {
    const loadBreadcrumbPath = async () => {
      if (!project.parent_id) {
        setBreadcrumbPath([])
        return
      }

      const { data, error } = await supabase.rpc('get_item_path', {
        item_id: project.parent_id
      })

      if (!error && data) {
        setBreadcrumbPath(data)
      }
    }

    loadBreadcrumbPath()
  }, [project.parent_id, supabase])

  const loadPage = async (page: number) => {
    setIsLoadingPage(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const start = (page - 1) * ITEMS_PER_PAGE
      const end = start + ITEMS_PER_PAGE - 1

      const { data: newItems, count } = await supabase
        .from('project_items')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('parent_id', project.id)
        .is('deleted_at', null)
        .order('type', { ascending: false })
        .order('name', { ascending: true })
        .range(start, end)

      if (newItems) setItems(newItems)
      if (count !== null) setTotalItems(count)
    } catch (error) {
      console.error('Load page error:', error)
    } finally {
      setIsLoadingPage(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    loadPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
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

  const handleItemCreated = (newItem: ProjectItem) => {
    // Always reload page 1 to keep sort order consistent
    setCurrentPage(1)
    setTotalItems(prev => prev + 1)
    loadPage(1)
  }

  const handleItemUpdated = (updatedItem: ProjectItem) => {
    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item))
  }

  const handleItemDeleted = (deletedId: string) => {
    setItems(items.filter(item => item.id !== deletedId))
    setTotalItems(prev => prev - 1)
  }

  const handleFolderUploadComplete = (newItems: ProjectItem[]) => {
    setCurrentPage(1)
    setTotalItems(prev => prev + newItems.length)
    loadPage(1)
  }

  const handleDelete = () => {
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    setDeleteConfirmOpen(false)
    try {
      const { error } = await supabase
        .from('project_items')
        .delete()
        .eq('id', project.id)

      if (error) throw error

      toast.success('Project deleted successfully')
      router.push('/dashboard/projects')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete project')
    }
  }

  // Get child items — items are already the current page of direct children
  const folders = items.filter(item => item.type === 'folder')
  const files = items.filter(item => item.type === 'file')

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbPath} currentPage={project.name} />

      {/* Header */}
      <div className="bg-white dark:bg-surface-container p-8 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] dark:shadow-none dark:border dark:border-white/[0.06]">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#4338ca] flex items-center justify-center text-white shadow-lg">
              <Folder className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[#191c1e] dark:text-on-surface mb-2">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-[#464554] dark:text-on-surface-variant font-medium">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {project.type === 'file' && project.content && (
              <button
                onClick={() => setIsPublishModalOpen(true)}
                className="p-2.5 bg-gradient-to-br from-[#4f46e5] to-[#4338ca] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 px-4"
                title="Publish to Marketplace"
              >
                <Upload className="h-4 w-4" />
                <span className="text-sm font-bold">Publish</span>
              </button>
            )}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-2.5 bg-white dark:bg-surface-container-high border border-[#c7c4d7]/30 dark:border-white/[0.09] text-[#191c1e] dark:text-on-surface rounded-lg hover:bg-[#f2f4f6] dark:hover:bg-surface-container-highest transition-all"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2.5 bg-white dark:bg-surface-container-high border border-[#ba1a1a]/30 text-[#ba1a1a] dark:text-destructive rounded-lg hover:bg-[#ba1a1a]/10 transition-all"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tags */}
        {project.language_tags && project.language_tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.language_tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white shadow-md"
                style={{ backgroundColor: tagColors[tag] || '#4f46e5' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            setCreateType('folder')
            setIsCreateModalOpen(true)
          }}
          className="px-4 py-2.5 bg-white dark:bg-surface-container border border-[#c7c4d7]/30 dark:border-white/[0.09] text-[#191c1e] dark:text-on-surface rounded-lg font-bold text-sm hover:bg-[#f2f4f6] dark:hover:bg-surface-container-high transition-all flex items-center gap-2"
        >
          <Folder className="h-4 w-4" />
          New Folder
        </button>
        <button
          onClick={() => {
            setCreateType('file')
            setIsCreateModalOpen(true)
          }}
          className="px-4 py-2.5 bg-white dark:bg-surface-container border border-[#c7c4d7]/30 dark:border-white/[0.09] text-[#191c1e] dark:text-on-surface rounded-lg font-bold text-sm hover:bg-[#f2f4f6] dark:hover:bg-surface-container-high transition-all flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New File
        </button>
        <FolderUploadButton
          parentId={project.id}
          onUploadComplete={handleFolderUploadComplete}
        />
      </div>

      {/* Content */}
      {totalItems === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-surface-container rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] dark:shadow-none dark:border dark:border-white/[0.06]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f2f4f6] dark:bg-surface-container-high flex items-center justify-center">
            <Folder className="h-8 w-8 text-[#464554] dark:text-on-surface-variant" />
          </div>
          <p className="text-[#464554] dark:text-on-surface-variant font-medium mb-4">
            This project is empty
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setCreateType('folder')
                setIsCreateModalOpen(true)
              }}
              className="px-4 py-2 bg-white dark:bg-surface-container-high border border-[#c7c4d7]/30 dark:border-white/[0.09] text-[#191c1e] dark:text-on-surface rounded-lg font-semibold text-sm hover:bg-[#f2f4f6] dark:hover:bg-surface-container-highest transition-all"
            >
              Create Folder
            </button>
            <button
              onClick={() => {
                setCreateType('file')
                setIsCreateModalOpen(true)
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
          {isLoadingPage && (
            <div className="absolute inset-0 bg-white/50 dark:bg-surface/50 flex items-center justify-center z-10 rounded-xl">
              <div className="text-[#464554] dark:text-on-surface-variant text-sm font-medium">Loading...</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative">
            {folders.map(folder => (
              <ItemCard
                key={folder.id}
                item={folder}
                onOpen={() => router.push(`/dashboard/projects/${folder.id}`)}
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
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        type={createType}
        parentId={project.id}
        onItemCreated={handleItemCreated}
      />

      {/* Edit Modal */}
      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        item={project}
        onItemUpdated={handleItemUpdated}
      />

      {/* Publish to Marketplace Modal */}
      {project.type === 'file' && (
        <PublishToMarketplaceModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          projectItem={project}
          onSuccess={() => {
            toast.success('Template published successfully!')
            router.push('/marketplace')
          }}
        />
      )}

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title={`Delete "${project.name}"?`}
        description="This will permanently delete this folder and all its contents. This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
