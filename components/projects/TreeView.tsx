'use client'

import { Tables } from '@/types/database.types'
import { TreeViewItem } from './TreeViewItem'
import { ChevronDown, ChevronRight, FolderKanban } from 'lucide-react'
import { cn } from '@/lib/utils'

type ProjectItem = Tables<'project_items'>

interface TreeNode {
  item: ProjectItem
  children: TreeNode[]
  level: number
}

interface TreeViewProps {
  tree: TreeNode[]
  expandedKeys: Set<string>
  selectedKey: string | null
  onToggle: (id: string) => void
  onSelect: (id: string) => void
  onExpandAll: () => void
  onCollapseAll: () => void
}

export function TreeView({
  tree,
  expandedKeys,
  selectedKey,
  onToggle,
  onSelect,
  onExpandAll,
  onCollapseAll,
}: TreeViewProps) {
  const hasExpandedItems = expandedKeys.size > 0

  return (
    <div className="h-full flex flex-col bg-white border-r border-[#c7c4d7]/20">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#c7c4d7]/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-[#4648d4]" />
          <h3 className="text-sm font-bold text-[#191c1e]">Explorer</h3>
        </div>
        <button
          onClick={hasExpandedItems ? onCollapseAll : onExpandAll}
          className="p-1 hover:bg-[#f2f4f6] rounded transition-colors"
          title={hasExpandedItems ? 'Collapse All' : 'Expand All'}
        >
          {hasExpandedItems ? (
            <ChevronDown className="h-4 w-4 text-[#464554]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[#464554]" />
          )}
        </button>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {tree.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-sm text-[#464554]">No items yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {tree.map(node => (
              <TreeViewItem
                key={node.item.id}
                node={node}
                expandedKeys={expandedKeys}
                selectedKey={selectedKey}
                onToggle={onToggle}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
