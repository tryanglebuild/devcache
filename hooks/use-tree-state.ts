import { useState, useMemo, useCallback } from 'react'
import { Tables } from '@/types/database.types'

type ProjectItem = Tables<'project_items'>

interface TreeNode {
  item: ProjectItem
  children: TreeNode[]
  level: number
}

export function useTreeState(items: ProjectItem[]) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  // Build tree structure from flat items (including files)
  const tree = useMemo(() => {
    const buildTree = (parentId: string | null, level: number = 0): TreeNode[] => {
      // Get both folders and files for this level
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

      // Return folders first, then files
      return [...folders, ...files]
    }

    return buildTree(null)
  }, [items])

  // Get all items for selected folder
  const selectedFolderItems = useMemo(() => {
    if (!selectedKey) {
      return items.filter(item => item.parent_id === null)
    }
    return items.filter(item => item.parent_id === selectedKey)
  }, [items, selectedKey])

  const toggleExpanded = useCallback((key: string) => {
    setExpandedKeys(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  const expandAll = useCallback(() => {
    const allFolderIds = items
      .filter(item => item.type === 'folder')
      .map(item => item.id)
    setExpandedKeys(new Set(allFolderIds))
  }, [items])

  const collapseAll = useCallback(() => {
    setExpandedKeys(new Set())
  }, [])

  const expandPath = useCallback((itemId: string) => {
    const path: string[] = []
    let currentId: string | null = itemId

    while (currentId) {
      const item = items.find(i => i.id === currentId)
      if (!item) break
      if (item.parent_id) {
        path.push(item.parent_id)
      }
      currentId = item.parent_id
    }

    setExpandedKeys(prev => new Set([...prev, ...path]))
  }, [items])

  return {
    tree,
    expandedKeys,
    selectedKey,
    selectedFolderItems,
    toggleExpanded,
    setSelectedKey,
    expandAll,
    collapseAll,
    expandPath,
  }
}
