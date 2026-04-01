'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronRight, Folder, FolderOpen, FileText, Copy, Trash2, Edit, Download, Star, StarOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tables } from '@/types/database.types'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

type ProjectItem = Tables<'project_items'>

interface TreeNode {
  item: ProjectItem
  children: TreeNode[]
  level: number
}

interface SidebarProjectsTreeProps {
  isCollapsed: boolean
}

export function SidebarProjectsTree({ isCollapsed }: SidebarProjectsTreeProps) {
  const [items, setItems] = useState<ProjectItem[]>([])
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
  const [contextMenu, setContextMenu] = useState<{
    item: ProjectItem
    x: number
    y: number
  } | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const clickCountRef = useRef<{ [key: string]: number }>({})

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

  const handleItemClick = (item: ProjectItem, hasChildren: boolean) => {
    const itemId = item.id
    
    // If item has no children (empty folder or file), navigate immediately on single click
    if (!hasChildren) {
      if (item.type === 'folder') {
        router.push(`/dashboard/projects/${item.id}`)
      } else {
        router.push(`/dashboard/projects/file/${item.id}`)
      }
      return
    }
    
    // For items with children, use double-click logic
    clickCountRef.current[itemId] = (clickCountRef.current[itemId] || 0) + 1
    
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
    }
    
    clickTimeoutRef.current = setTimeout(() => {
      const clickCount = clickCountRef.current[itemId] || 0
      
      if (clickCount === 1) {
        if (item.type === 'folder') {
          toggleExpanded(item.id)
        }
      } else if (clickCount >= 2) {
        if (item.type === 'folder') {
          router.push(`/dashboard/projects/${item.id}`)
        } else {
          router.push(`/dashboard/projects/file/${item.id}`)
        }
      }
      
      clickCountRef.current[itemId] = 0
    }, 300)
  }

  const toggleExpanded = (id: string) => {
    setExpandedKeys(prev => {
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

  const handleDelete = async (item: ProjectItem) => {
    const confirmMessage = item.type === 'folder' 
      ? `Delete folder "${item.name}" and all its contents?`
      : `Delete file "${item.name}"?`
    
    if (!confirm(confirmMessage)) return

    const { error } = await supabase
      .from('project_items')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', item.id)

    if (error) {
      toast.error('Failed to delete')
    } else {
      toast.success('Moved to trash')
      reloadItems()
    }
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

  const renderNode = (node: TreeNode) => {
    const isExpanded = expandedKeys.has(node.item.id)
    const isCurrentPath = pathname === `/dashboard/projects/${node.item.id}` || 
                          pathname === `/dashboard/projects/file/${node.item.id}`
    const hasChildren = node.children.length > 0
    const isFile = node.item.type === 'file'

    return (
      <div key={node.item.id}>
        <button
          onClick={() => handleItemClick(node.item, hasChildren)}
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
              ? 'bg-blue-50 text-[#4648d4] font-semibold'
              : 'text-gray-700 hover:bg-gray-100'
          )}
          style={{ paddingLeft: `${8 + node.level * 16}px` }}
        >
          {hasChildren && !isFile ? (
            <ChevronRight
              className={cn('h-3.5 w-3.5 transition-transform shrink-0', isExpanded && 'rotate-90')}
            />
          ) : (
            <div className="w-3.5" />
          )}

          {isFile ? (
            <FileText className="h-4 w-4 shrink-0 text-gray-500" />
          ) : isExpanded ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-[#4648d4]" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-gray-500" />
          )}

          <span className="truncate flex-1 text-left text-[13px]">{node.item.name}</span>
          
          {node.item.is_favorite && (
            <Star className="h-3 w-3 shrink-0 text-amber-500 fill-amber-500" />
          )}
        </button>

        {isExpanded && hasChildren && !isFile && (
          <div>{node.children.map(renderNode)}</div>
        )}
      </div>
    )
  }

  if (isCollapsed) {
    return null
  }

  return (
    <>
      <div className="space-y-0.5 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
        {tree.map(renderNode)}
      </div>

      {/* Custom Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-[100] min-w-[200px] bg-white rounded-xl shadow-2xl border border-gray-200 py-1.5"
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
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#4648d4] transition-colors font-medium"
          >
            <Edit className="h-4 w-4" />
            Rename
          </button>

          <button
            onClick={() => {
              handleDuplicate(contextMenu.item)
              setContextMenu(null)
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#4648d4] transition-colors font-medium"
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
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#4648d4] transition-colors font-medium"
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
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors font-medium"
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

          <div className="h-px bg-gray-200 my-1.5" />

          <button
            onClick={() => {
              handleDelete(contextMenu.item)
              setContextMenu(null)
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </>
  )
}
