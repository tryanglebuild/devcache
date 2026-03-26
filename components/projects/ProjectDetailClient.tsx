'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tables } from '@/types/database.types'
import { Plus, Folder, FileText, Star, Edit, Trash2 } from 'lucide-react'
import { CreateItemSheet } from './CreateItemSheet'
import { EditItemSheet } from './EditItemSheet'
import { ItemCard } from './ItemCard'
import { Breadcrumb } from './Breadcrumb'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

type ProjectItem = Tables<'project_items'>

interface ProjectDetailClientProps {
  project: ProjectItem
  allItems: ProjectItem[]
}

export function ProjectDetailClient({ project, allItems }: ProjectDetailClientProps) {
  const router = useRouter()
  const [items, setItems] = useState<ProjectItem[]>(allItems)
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [createType, setCreateType] = useState<'folder' | 'file'>('folder')
  const [breadcrumbPath, setBreadcrumbPath] = useState<ProjectItem[]>([])
  const [tagColors, setTagColors] = useState<Record<string, string>>({})

  const supabase = createClient()

  // Load tag colors
  useEffect(() => {
    const loadTagColors = async () => {
      if (!project.language_tags || project.language_tags.length === 0) return

      const { data, error } = await supabase
        .from('language_tags')
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

  const handleItemCreated = (newItem: ProjectItem) => {
    setItems([...items, newItem])
  }

  const handleItemUpdated = (updatedItem: ProjectItem) => {
    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item))
  }

  const handleItemDeleted = (deletedId: string) => {
    setItems(items.filter(item => item.id !== deletedId))
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

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

  // Get child items
  const childItems = items.filter(item => item.parent_id === project.id)
  const folders = childItems.filter(item => item.type === 'folder')
  const files = childItems.filter(item => item.type === 'file')

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbPath} currentPage={project.name} />

      {/* Header */}
      <div className="bg-white p-8 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)]">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#4648d4] to-[#6063ee] flex items-center justify-center text-white shadow-lg">
              <Folder className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[#191c1e] mb-2">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-[#464554] font-medium">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsEditSheetOpen(true)}
              className="p-2.5 bg-white border border-[#c7c4d7]/30 text-[#191c1e] rounded-lg hover:bg-[#f2f4f6] transition-all"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2.5 bg-white border border-[#ba1a1a]/30 text-[#ba1a1a] rounded-lg hover:bg-[#ba1a1a]/10 transition-all"
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
                style={{ backgroundColor: tagColors[tag] || '#4648d4' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#4648d4]/10 flex items-center justify-center text-[#4648d4]">
            <Folder className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#464554] uppercase tracking-widest">Folders</p>
            <p className="text-xl font-black text-[#191c1e]">{folders.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#575992]/10 flex items-center justify-center text-[#575992]">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#464554] uppercase tracking-widest">Files</p>
            <p className="text-xl font-black text-[#191c1e]">{files.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#904900]/10 flex items-center justify-center text-[#904900]">
            <Star className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#464554] uppercase tracking-widest">Favorites</p>
            <p className="text-xl font-black text-[#191c1e]">
              {childItems.filter(item => item.is_favorite).length}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            setCreateType('folder')
            setIsCreateSheetOpen(true)
          }}
          className="px-4 py-2.5 bg-white border border-[#c7c4d7]/30 text-[#191c1e] rounded-lg font-bold text-sm hover:bg-[#f2f4f6] transition-all flex items-center gap-2"
        >
          <Folder className="h-4 w-4" />
          New Folder
        </button>
        <button
          onClick={() => {
            setCreateType('file')
            setIsCreateSheetOpen(true)
          }}
          className="px-4 py-2.5 bg-gradient-to-br from-[#4648d4] to-[#6063ee] text-white rounded-lg font-bold text-sm shadow-lg shadow-[#4648d4]/20 hover:shadow-xl transition-all flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New File
        </button>
      </div>

      {/* Content */}
      {childItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f2f4f6] flex items-center justify-center">
            <Folder className="h-8 w-8 text-[#464554]" />
          </div>
          <p className="text-[#464554] font-medium mb-4">
            This project is empty
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setCreateType('folder')
                setIsCreateSheetOpen(true)
              }}
              className="px-4 py-2 bg-white border border-[#c7c4d7]/30 text-[#191c1e] rounded-lg font-semibold text-sm hover:bg-[#f2f4f6] transition-all"
            >
              Create Folder
            </button>
            <button
              onClick={() => {
                setCreateType('file')
                setIsCreateSheetOpen(true)
              }}
              className="px-4 py-2 bg-gradient-to-br from-[#4648d4] to-[#6063ee] text-white rounded-lg font-semibold text-sm shadow-lg shadow-[#4648d4]/20 hover:shadow-xl transition-all"
            >
              Create File
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
      )}

      {/* Create Sheet */}
      <CreateItemSheet
        isOpen={isCreateSheetOpen}
        onClose={() => setIsCreateSheetOpen(false)}
        type={createType}
        parentId={project.id}
        onItemCreated={handleItemCreated}
      />

      {/* Edit Sheet */}
      <EditItemSheet
        isOpen={isEditSheetOpen}
        onClose={() => setIsEditSheetOpen(false)}
        item={project}
        onItemUpdated={handleItemUpdated}
      />
    </div>
  )
}
