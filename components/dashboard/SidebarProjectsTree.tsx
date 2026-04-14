'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronRight, Folder, FolderOpen, FileText, Copy, Trash2, Edit, Download, Star, StarOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tables } from '@/types/database.types'
import { createClient } from '@/lib/supabase/client'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import toast from 'react-hot-toast'

type ProjectItem = Tables<'project_items'>

interface TreeNode {
  item: ProjectItem
  children: TreeNode[]
  level: number
}

interface PendingItem {
  type: 'folder' | 'file'
  parentId: string | null
  name: string
}

interface SidebarProjectsTreeProps {
  isCollapsed: boolean
  quickCreateType?: 'folder' | 'file' | null
  onQuickCreateDone?: () => void
}

export function SidebarProjectsTree({ isCollapsed, quickCreateType, onQuickCreateDone }: SidebarProjectsTreeProps) {
  const [items, setItems] = useState<ProjectItem[]>([])
  const [userExpandedKeys, setUserExpandedKeys] = useState<Set<string>>(new Set())
  const [contextMenu, setContextMenu] = useState<{
    item: ProjectItem
    x: number
    y: number
  } | null>(null)
  const [pendingItem, setPendingItem] = useState<PendingItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProjectItem | null>(null)
  const pendingInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Derive contextual parentId from current pathname
  const getContextualParentId = (): string | null => {
    if (!pathname) return null

    // /dashboard/projects/:id → selected folder → create inside it
    const folderMatch = pathname.match(/\/dashboard\/projects\/([^/]+)$/)
    if (folderMatch) {
      const folderId = folderMatch[1]
      const folder = items.find(i => i.id === folderId && i.type === 'folder')
      if (folder) return folderId
    }

    // /dashboard/projects/file/:id → selected file → create as sibling (use file's parent)
    const fileMatch = pathname.match(/\/dashboard\/projects\/file\/([^/]+)$/)
    if (fileMatch) {
      const fileId = fileMatch[1]
      const file = items.find(i => i.id === fileId && i.type === 'file')
      if (file) return file.parent_id ?? null
    }

    return null
  }

  // Compute ancestor folders that must be expanded for the current URL path.
  // This is derived synchronously so it's always in sync with pathname + items.
  const pathExpandedKeys = useMemo(() => {
    if (!pathname || items.length === 0) return new Set<string>()

    const folderMatch = pathname.match(/\/dashboard\/projects\/([^/]+)$/)
    const fileMatch = pathname.match(/\/dashboard\/projects\/file\/([^/]+)$/)
    const targetId = folderMatch?.[1] || fileMatch?.[1]
    if (!targetId) return new Set<string>()

    const target = items.find(i => i.id === targetId)
    if (!target) return new Set<string>()

    const ancestors = new Set<string>()
    let parentId = target.parent_id
    while (parentId) {
      ancestors.add(parentId)
      const parent = items.find(i => i.id === parentId)
      parentId = parent?.parent_id ?? null
    }
    return ancestors
  }, [pathname, items])

  // Effective expanded keys = user's manual toggles + path-driven auto-expansion
  const expandedKeys = useMemo(
    () => new Set([...userExpandedKeys, ...pathExpandedKeys]),
    [userExpandedKeys, pathExpandedKeys]
  )

  // Trigger inline creation when quickCreateType changes
  useEffect(() => {
    if (quickCreateType) {
      const defaultName = quickCreateType === 'folder' ? 'New Folder' : 'New File'
      const parentId = getContextualParentId()
      setPendingItem({ type: quickCreateType, parentId, name: defaultName })
      // Expand parent so the pending item is visible
      if (parentId) setUserExpandedKeys(prev => new Set([...prev, parentId]))
      onQuickCreateDone?.()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickCreateType])

  // Focus input when pendingItem appears
  useEffect(() => {
    if (pendingItem) {
      setTimeout(() => {
        pendingInputRef.current?.focus()
        pendingInputRef.current?.select()
      }, 50)
    }
  }, [pendingItem])

  const resolveUniqueName = (baseName: string, parentId: string | null): string => {
    const siblings = items.filter(i => i.parent_id === parentId && i.deleted_at === null)
    const siblingNames = new Set(siblings.map(i => i.name.toLowerCase()))

    if (!siblingNames.has(baseName.toLowerCase())) return baseName

    let counter = 1
    let candidate: string
    do {
      candidate = `${baseName} ${String(counter).padStart(2, '0')}`
      counter++
    } while (siblingNames.has(candidate.toLowerCase()))

    return candidate
  }

  const commitPendingItem = async () => {
    if (!pendingItem) return
    const rawName = pendingItem.name.trim()
    if (!rawName) {
      setPendingItem(null)
      return
    }

    const name = resolveUniqueName(rawName, pendingItem.parentId)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setPendingItem(null); return }

    const { data: item, error } = await supabase
      .from('project_items')
      .insert({
        user_id: user.id,
        parent_id: pendingItem.parentId,
        name,
        type: pendingItem.type,
      })
      .select()
      .single()

    if (error) {
      toast.error('Failed to create')
    } else if (item) {
      reloadItems()
      if (item.type === 'file') {
        router.push(`/dashboard/projects/file/${item.id}`)
      }
    }
    setPendingItem(null)
  }

  const cancelPendingItem = () => setPendingItem(null)

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null)
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null)
    }
    
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('click', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [contextMenu])

  // Load items
  useEffect(() => {
    const loadItems = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('project_items')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('type', { ascending: false })
        .order('name', { ascending: true })

      if (data) {
        setItems(data)
      }
    }

    loadItems()

    // Subscribe to changes
    const channel = supabase
      .channel('sidebar-items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_items' }, loadItems)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Build tree
  const buildTree = (parentId: string | null, level: number = 0): TreeNode[] => {
    const folders = items
      .filter(item => item.parent_id === parentId && item.type === 'folder')
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(item => ({
        item,
        children: buildTree(item.id, level + 1),
        level,
      }))

    const files = items
      .filter(item => item.parent_id === parentId && item.type === 'file')
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(item => ({
        item,
        children: [],
        level,
      }))

    return [...folders, ...files]
  }

  const tree = buildTree(null)

  const handleItemClick = (item: ProjectItem) => {
    if (item.type === 'file') {
      router.push(`/dashboard/projects/file/${item.id}`)
      return
    }

    // Folders: single click toggles expand/collapse
    toggleExpanded(item.id)
  }

  const handleItemDoubleClick = (item: ProjectItem) => {
    if (item.type === 'folder') {
      router.push(`/dashboard/projects/${item.id}`)
    }
  }

  const toggleExpanded = (id: string) => {
    setUserExpandedKeys(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const reloadItems = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('project_items')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('type', { ascending: false })
        .order('name', { ascending: true })
      if (data) setItems(data)
    }
  }

  const handleRename = async (item: ProjectItem) => {
    const newName = prompt(`Rename ${item.type}:`, item.name)
    if (!newName || newName === item.name) return

    const { error } = await supabase
      .from('project_items')
      .update({ name: newName })
      .eq('id', item.id)

    if (error) {
      toast.error('Failed to rename')
    } else {
      toast.success(`${item.type === 'folder' ? 'Folder' : 'File'} renamed`)
      reloadItems()
    }
  }

  const handleDelete = (item: ProjectItem) => {
    setDeleteTarget(item)
    setContextMenu(null)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const { error } = await supabase
      .from('project_items')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', deleteTarget.id)

    if (error) {
      toast.error('Failed to delete')
    } else {
      toast.success('Moved to trash')
      reloadItems()
    }
    setDeleteTarget(null)
  }

  const handleDuplicate = async (item: ProjectItem) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const newName = `${item.name} (copy)`
    
    const { error } = await supabase
      .from('project_items')
      .insert({
        user_id: user.id,
        name: newName,
        type: item.type,
        content: item.content,
        parent_id: item.parent_id,
      })

    if (error) {
      toast.error('Failed to duplicate')
    } else {
      toast.success('Duplicated successfully')
      reloadItems()
    }
  }

  const handleDownload = (item: ProjectItem) => {
    if (item.type === 'folder') {
      toast.error('Cannot download folders')
      return
    }

    const blob = new Blob([item.content || ''], { type: 'text/markdown' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = item.name.endsWith('.md') ? item.name : `${item.name}.md`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    toast.success('Downloaded')
  }

  const handleToggleFavorite = async (item: ProjectItem) => {
    const { error } = await supabase
      .from('project_items')
      .update({ is_favorite: !item.is_favorite })
      .eq('id', item.id)

    if (error) {
      toast.error('Failed to update')
    } else {
      toast.success(item.is_favorite ? 'Removed from favorites' : 'Added to favorites')
      reloadItems()
    }
  }

  const renderPendingInput = (level: number) => (
    <div
      className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-blue-50 dark:bg-[#7c7ff5]/10"
      style={{ paddingLeft: `${8 + level * 16}px` }}
    >
      <div className="w-3.5" />
      {pendingItem!.type === 'folder'
        ? <Folder className="h-4 w-4 shrink-0 text-[#4f46e5] dark:text-[#7c7ff5]" />
        : <FileText className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" />
      }
      <input
        ref={pendingInputRef}
        value={pendingItem!.name}
        onChange={e => setPendingItem({ ...pendingItem!, name: e.target.value })}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); commitPendingItem() }
          if (e.key === 'Escape') { e.preventDefault(); cancelPendingItem() }
        }}
        onBlur={commitPendingItem}
        className="flex-1 text-[13px] bg-transparent outline-none border-b border-[#4f46e5] dark:border-[#7c7ff5] text-gray-900 dark:text-on-surface min-w-0"
      />
    </div>
  )

  const renderNode = (node: TreeNode) => {
    const isExpanded = expandedKeys.has(node.item.id)
    const isCurrentPath = pathname === `/dashboard/projects/${node.item.id}` || 
                          pathname === `/dashboard/projects/file/${node.item.id}`
    const isFile = node.item.type === 'file'
    const isPendingParent = pendingItem?.parentId === node.item.id
    const hasChildren = node.children.length > 0

    return (
      <div key={node.item.id}>
        <button
          onClick={() => handleItemClick(node.item)}
          onDoubleClick={() => handleItemDoubleClick(node.item)}
          onContextMenu={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setContextMenu({
              item: node.item,
              x: e.clientX,
              y: e.clientY,
            })
          }}
          className={cn(
            'w-full flex items-center gap-2 px-2 py-2 text-sm rounded-lg transition-all',
            isCurrentPath
              ? 'bg-blue-50 dark:bg-[#7c7ff5]/10 text-[#4f46e5] dark:text-[#7c7ff5] font-semibold'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-container-high'
          )}
          style={{ paddingLeft: `${8 + node.level * 16}px` }}
        >
          {!isFile && hasChildren ? (
            <ChevronRight
              className={cn('h-3.5 w-3.5 transition-transform shrink-0', isExpanded && 'rotate-90')}
            />
          ) : (
            <div className="w-3.5" />
          )}

          {isFile ? (
            <FileText className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" />
          ) : isExpanded || isPendingParent ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-[#4f46e5] dark:text-[#7c7ff5]" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" />
          )}

          <span className="truncate flex-1 text-left text-[13px]">{node.item.name}</span>
          
          {node.item.is_favorite && (
            <Star className="h-3 w-3 shrink-0 text-gray-400 dark:text-gray-500 fill-gray-400 dark:fill-gray-500" />
          )}
        </button>

        {(isExpanded || isPendingParent) && !isFile && (
          <div>
            {isPendingParent && renderPendingInput(node.level + 1)}
            {node.children.map(renderNode)}
          </div>
        )}
      </div>
    )
  }

  if (isCollapsed) {
    return null
  }

  return (
    <>
      <div className="space-y-0.5 h-full overflow-y-auto pr-1 custom-scrollbar">
        {pendingItem && pendingItem.parentId === null && renderPendingInput(0)}
        {tree.map(renderNode)}
      </div>

      {/* Custom Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-[100] min-w-[200px] bg-white dark:bg-surface-container rounded-xl shadow-2xl border border-gray-200 dark:border-white/[0.09] py-1.5"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              handleRename(contextMenu.item)
              setContextMenu(null)
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-[#7c7ff5]/10 hover:text-[#4f46e5] dark:hover:text-[#7c7ff5] transition-colors font-medium"
          >
            <Edit className="h-4 w-4" />
            Rename
          </button>

          <button
            onClick={() => {
              handleDuplicate(contextMenu.item)
              setContextMenu(null)
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-[#7c7ff5]/10 hover:text-[#4f46e5] dark:hover:text-[#7c7ff5] transition-colors font-medium"
          >
            <Copy className="h-4 w-4" />
            Duplicate
          </button>

          {contextMenu.item.type === 'file' && (
            <button
              onClick={() => {
                handleDownload(contextMenu.item)
                setContextMenu(null)
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-[#7c7ff5]/10 hover:text-[#4f46e5] dark:hover:text-[#7c7ff5] transition-colors font-medium"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          )}

          <button
            onClick={() => {
              handleToggleFavorite(contextMenu.item)
              setContextMenu(null)
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-400/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium"
          >
            {contextMenu.item.is_favorite ? (
              <>
                <StarOff className="h-4 w-4" />
                Remove from Favorites
              </>
            ) : (
              <>
                <Star className="h-4 w-4" />
                Add to Favorites
              </>
            )}
          </button>

          <div className="h-px bg-gray-200 dark:bg-white/[0.06] my-1.5" />

          <button
            onClick={() => handleDelete(contextMenu.item)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors font-medium"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={deleteTarget?.type === 'folder' ? `Delete "${deleteTarget?.name}"?` : `Delete "${deleteTarget?.name}"?`}
        description={
          deleteTarget?.type === 'folder'
            ? 'This will delete the folder and all its contents. The items will be moved to trash.'
            : 'This file will be moved to trash.'
        }
        confirmLabel="Move to Trash"
      />
    </>
  )
}
