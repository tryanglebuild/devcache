'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { CreateItemModal } from '@/components/projects/CreateItemModal'
import { Tables } from '@/types/database.types'

type ProjectItem = Tables<'project_items'>

interface CreateItemContextType {
  openCreateModal: (type: 'folder' | 'file', parentId?: string | null) => void
}

const CreateItemContext = createContext<CreateItemContextType>({
  openCreateModal: () => {},
})

export function useCreateItem() {
  return useContext(CreateItemContext)
}

export function CreateItemProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<'folder' | 'file'>('folder')
  const [parentId, setParentId] = useState<string | null>(null)

  const openCreateModal = (itemType: 'folder' | 'file', itemParentId: string | null = null) => {
    setType(itemType)
    setParentId(itemParentId)
    setIsOpen(true)
  }

  const handleItemCreated = (item: ProjectItem) => {
    setIsOpen(false)
    // Trigger a page refresh to show the new item
    window.location.reload()
  }

  return (
    <CreateItemContext.Provider value={{ openCreateModal }}>
      {children}
      <CreateItemModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        type={type}
        parentId={parentId}
        onItemCreated={handleItemCreated}
      />
    </CreateItemContext.Provider>
  )
}
