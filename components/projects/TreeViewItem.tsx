'use client'

import { Tables } from '@/types/database.types'
import { ChevronRight, Folder, FolderOpen, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

type ProjectItem = Tables<'project_items'>

interface TreeNode {
  item: ProjectItem
  children: TreeNode[]
  level: number
}

interface TreeViewItemProps {
  node: TreeNode
  expandedKeys: Set<string>
  selectedKey: string | null
  onToggle: (id: string) => void
  onSelect: (id: string) => void
}

export function TreeViewItem({
  node,
  expandedKeys,
  selectedKey,
  onToggle,
  onSelect,
}: TreeViewItemProps) {
  const isExpanded = expandedKeys.has(node.item.id)
  const isSelected = selectedKey === node.item.id
  const hasChildren = node.children.length > 0
  const { item, level } = node
  const isFile = item.type === 'file'

  const handleClick = () => {
    onSelect(item.id)
    if (hasChildren && !isExpanded && !isFile) {
      onToggle(item.id)
    }
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggle(item.id)
  }

  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors rounded-lg group',
          'hover:bg-[#f2f4f6]',
          isSelected && 'bg-[#4f46e5]/10 text-[#4f46e5] border-l-3 border-[#4f46e5]'
        )}
        style={{ paddingLeft: `${12 + level * 20}px` }}
      >
        {/* Expand/Collapse Arrow (only for folders with children) */}
        {hasChildren && !isFile ? (
          <button
            onClick={handleToggle}
            className="p-0.5 hover:bg-[#e5e7eb] rounded transition-colors"
          >
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform text-[#464554]',
                isExpanded && 'rotate-90'
              )}
            />
          </button>
        ) : (
          <div className="w-5" /> // Spacer for alignment
        )}

        {/* Icon */}
        <div className="shrink-0">
          {isFile ? (
            <FileText className={cn(
              'h-4 w-4',
              isSelected ? 'text-[#4f46e5]' : 'text-[#464554] group-hover:text-[#4f46e5]'
            )} />
          ) : isExpanded ? (
            <FolderOpen className="h-4 w-4 text-[#4f46e5]" />
          ) : (
            <Folder className="h-4 w-4 text-[#464554] group-hover:text-[#4f46e5]" />
          )}
        </div>

        {/* Name */}
        <span className={cn(
          'flex-1 text-left truncate',
          isSelected ? 'text-[#4f46e5]' : 'text-[#191c1e]'
        )}>
          {item.name}
        </span>

        {/* Item Count Badge (only for folders with children) */}
        {hasChildren && !isFile && (
          <span className="text-xs text-[#464554] bg-[#f2f4f6] px-2 py-0.5 rounded-full">
            {node.children.length}
          </span>
        )}
      </button>

      {/* Render Children (only for folders) */}
      {isExpanded && hasChildren && !isFile && (
        <div>
          {node.children.map(child => (
            <TreeViewItem
              key={child.item.id}
              node={child}
              expandedKeys={expandedKeys}
              selectedKey={selectedKey}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
