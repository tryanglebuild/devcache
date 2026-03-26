'use client'

import { useState } from 'react'
import { Tables } from '@/types/database.types'
import { Plus, Folder, FileText, Star, MoreVertical, FolderOpen } from 'lucide-react'
import { CreateItemDialog } from './CreateItemDialog'
import { ItemCard } from './ItemCard'
import { Breadcrumb } from './Breadcrumb'

type ProjectItem = Tables<'project_items'>

interface ProjectsClientProps {
  initialItems: ProjectItem[]
}

export function ProjectsClient({ initialItems }: ProjectsClientProps) {
  const [items, setItems] = useState<ProjectItem[]>(initialItems)
  const [currentFolder, setCurrentFolder] = useState<ProjectItem | null>(null)
  const [breadcrumb, setBreadcrumb] = useState<ProjectItem[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createType, setCreateType] = useState<'folder' | 'file'>('folder')

  const handleOpenFolder = (folder: ProjectItem) => {
    setCurrentFolder(folder)
    setBreadcrumb([...breadcrumb, folder])
  }

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      // Root
      setCurrentFolder(null)
      setBreadcrumb([])
    } else {
      const folder = breadcrumb[index]
      setCurrentFolder(folder)
      setBreadcrumb(breadcrumb.slice(0, index + 1))
    }
  }

  const handleItemCreated = (newItem: ProjectItem) => {
    setItems([...items, newItem])
  }

  const handleItemUpdated = (updatedItem: ProjectItem) => {
    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item))
  }

  const handleItemDeleted = (deletedId: string) => {
    setItems(items.filter(item => item.id !== deletedId))
  }

  const currentItems = items.filter(item => 
    item.parent_id === (currentFolder?.id || null)
  )

  const folders = currentItems.filter(item => item.type === 'folder')
  const files = currentItems.filter(item => item.type === 'file')

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-[#191c1e] mb-2">
            Projects
          </h2>
          <p className="text-[#464554] font-medium">
            Organize your development resources with folders and markdown files
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setCreateType('folder')
              setIsCreateDialogOpen(true)
            }}
            className="px-4 py-2.5 bg-white border border-[#c7c4d7]/30 text-[#191c1e] rounded-lg font-bold text-sm hover:bg-[#f2f4f6] transition-all flex items-center gap-2"
          >
            <Folder className="h-4 w-4" />
            New Folder
          </button>
          <button
            onClick={() => {
              setCreateType('file')
              setIsCreateDialogOpen(true)
            }}
            className="px-4 py-2.5 bg-gradient-to-br from-[#4648d4] to-[#6063ee] text-white rounded-lg font-bold text-sm shadow-lg shadow-[#4648d4]/20 hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New File
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb 
        items={breadcrumb} 
        onNavigate={handleBreadcrumbClick}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
              {items.filter(item => item.is_favorite).length}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {currentItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f2f4f6] flex items-center justify-center">
            <FolderOpen className="h-8 w-8 text-[#464554]" />
          </div>
          <p className="text-[#464554] font-medium mb-4">
            {currentFolder ? 'This folder is empty' : 'No projects yet'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setCreateType('folder')
                setIsCreateDialogOpen(true)
              }}
              className="px-4 py-2 bg-white border border-[#c7c4d7]/30 text-[#191c1e] rounded-lg font-semibold text-sm hover:bg-[#f2f4f6] transition-all"
            >
              Create Folder
            </button>
            <button
              onClick={() => {
                setCreateType('file')
                setIsCreateDialogOpen(true)
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
      )}

      {/* Create Dialog */}
      <CreateItemDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        type={createType}
        parentId={currentFolder?.id || null}
        onItemCreated={handleItemCreated}
      />
    </div>
  )
}
