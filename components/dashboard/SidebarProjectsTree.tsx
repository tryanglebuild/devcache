'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronRight, Folder, FolderOpen, FileText, FolderKanban } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tables } from '@/types/database.types'
import { createClient } from '@/lib/supabase/client'

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
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Load items
  useEffect(() => {
    const loadItems = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('project_items')
        .select('*')
        .eq('user_id', user.id)
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

  const handleNavigate = (item: ProjectItem) => {
    if (item.type === 'folder') {
      router.push(`/dashboard/projects/${item.id}`)
    } else {
      router.push(`/dashboard/projects/file/${item.id}`)
    }
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

  const isActive = pathname?.startsWith('/dashboard/projects')

  const renderNode = (node: TreeNode) => {
    const isExpanded = expandedKeys.has(node.item.id)
    const isCurrentPath = pathname === `/dashboard/projects/${node.item.id}` || 
                          pathname === `/dashboard/projects/file/${node.item.id}`
    const hasChildren = node.children.length > 0
    const isFile = node.item.type === 'file'

    return (
      <div key={node.item.id}>
        <button
          onClick={() => {
            handleNavigate(node.item)
            if (hasChildren && !isFile) {
              toggleExpanded(node.item.id)
            }
          }}
          className={cn(
            'w-full flex items-center gap-2 px-2 py-2 text-sm rounded transition-all',
            isCurrentPath
              ? 'bg-[#4648d4]/10 text-[#4648d4] font-semibold'
              : 'text-[#464554] hover:bg-[#e0e3e5] hover:text-[#191c1e]'
          )}
          style={{ paddingLeft: `${8 + node.level * 16}px` }}
        >
          {hasChildren && !isFile ? (
            <ChevronRight
              className={cn('h-4 w-4 transition-transform shrink-0', isExpanded && 'rotate-90')}
            />
          ) : (
            <div className="w-4" />
          )}

          {isFile ? (
            <FileText className="h-4 w-4 shrink-0" />
          ) : isExpanded ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-[#4648d4]" />
          ) : (
            <Folder className="h-4 w-4 shrink-0" />
          )}

          <span className="truncate flex-1 text-left">{node.item.name}</span>
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
    <div className="space-y-1">
      {/* Projects Header */}
      <button
        onClick={() => {
          setIsProjectsExpanded(!isProjectsExpanded)
          router.push('/dashboard/projects')
        }}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
          isActive
            ? 'bg-white text-[#4648d4] shadow-sm font-bold'
            : 'text-[#464554] hover:text-[#191c1e] hover:bg-[#e0e3e5]'
        )}
      >
        <FolderKanban className="h-5 w-5 shrink-0" />
        <span className="text-sm font-medium uppercase tracking-wider flex-1 text-left">
          Projects
        </span>
        <ChevronRight
          className={cn('h-4 w-4 transition-transform shrink-0', isProjectsExpanded && 'rotate-90')}
        />
      </button>

      {/* Tree View */}
      {isProjectsExpanded && tree.length > 0 && (
        <div className="pl-2 space-y-0.5 max-h-[400px] overflow-y-auto">
          {tree.map(renderNode)}
        </div>
      )}
    </div>
  )
}
