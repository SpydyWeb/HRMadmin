import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import type React from 'react'
import Button from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  BiBox,
  BiChevronDown,
  BiChevronRight,
  BiFolder,
  BiSearch,
} from 'react-icons/bi'
import { BsInfo } from 'react-icons/bs'
import { IoIosClose } from 'react-icons/io'

export interface TreeViewItem {
  id: string
  name: string
  type: string
  children?: TreeViewItem[]
  checked?: boolean
}

export interface TreeViewIconMap {
  [key: string]: React.ReactNode | undefined
}

export interface TreeViewMenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  action: (items: TreeViewItem[]) => void
}

export interface TreeViewProps {
  className?: string
  data: TreeViewItem[]
  title?: string
  showExpandAll?: boolean
  showSeach?: boolean
  showCheckboxes?: boolean
  checkboxPosition?: 'left' | 'right'
  searchPlaceholder?: string
  selectionText?: string
  checkboxLabels?: {
    check: string
    uncheck: string
  }
  getIcon?: (item: TreeViewItem, depth: number) => React.ReactNode
  onSelectionChange?: (selectedItems: TreeViewItem[]) => void
  onAction?: (action: string, items: TreeViewItem[]) => void
  onCheckChange?: (item: TreeViewItem, checked: boolean) => void
  iconMap?: TreeViewIconMap
  menuItems?: TreeViewMenuItem[]
}

interface TreeItemProps {
  item: TreeViewItem
  depth?: number
  selectedIds: Set<string>
  lastSelectedId: React.MutableRefObject<string | null>
  onSelect: (ids: Set<string>) => void
  expandedIds: Set<string>
  onToggleExpand: (id: string, isOpen: boolean) => void
  getIcon?: (item: TreeViewItem, depth: number) => React.ReactNode
  onAction?: (action: string, items: TreeViewItem[]) => void
  onAccessChange?: (item: TreeViewItem, hasAccess: boolean) => void
  allItems: TreeViewItem[]
  showAccessRights?: boolean
  itemMap: Map<string, TreeViewItem>
  iconMap?: TreeViewIconMap
  menuItems?: TreeViewMenuItem[]
  getSelectedItems: () => TreeViewItem[]
}

// Build id->item map
const buildItemMap = (items: TreeViewItem[]): Map<string, TreeViewItem> => {
  const map = new Map<string, TreeViewItem>()
  const visit = (node: TreeViewItem) => {
    map.set(node.id, node)
    node.children?.forEach(visit)
  }
  items.forEach(visit)
  return map
}

// Bottom-up check state
const getCheckState = (
  item: TreeViewItem,
  itemMap: Map<string, TreeViewItem>,
): 'checked' | 'unchecked' | 'indeterminate' => {
  const originalItem = itemMap.get(item.id)
  if (!originalItem) return 'unchecked'
  if (!originalItem.children || originalItem.children.length === 0) {
    return originalItem.checked ? 'checked' : 'unchecked'
  }
  let checkedCount = 0
  let indeterminateCount = 0
  originalItem.children.forEach((child) => {
    const childState = getCheckState(child, itemMap)
    if (childState === 'checked') checkedCount++
    if (childState === 'indeterminate') indeterminateCount++
  })
  const total = originalItem.children.length
  if (checkedCount === total) return 'checked'
  if (checkedCount > 0 || indeterminateCount > 0) return 'indeterminate'
  return 'unchecked'
}

// Default icons
const defaultIconMap: TreeViewIconMap = {
  file: <BiBox className="h-4 w-4 text-red-600" />,
  folder: (
    <BiFolder className="h-4 w-4 text-neutral-900/80 dark:text-neutral-50/80" />
  ),
}

function TreeItem({
  item,
  depth = 0,
  selectedIds,
  lastSelectedId,
  onSelect,
  expandedIds,
  onToggleExpand,
  getIcon,
  onAction,
  onAccessChange,
  allItems,
  showAccessRights,
  itemMap,
  iconMap = defaultIconMap,
  menuItems,
  getSelectedItems,
}: TreeItemProps): JSX.Element {
  const isOpen = expandedIds.has(item.id)
  const isSelected = selectedIds.has(item.id)
  const itemRef = useRef<HTMLDivElement>(null)
  const [selectionStyle, setSelectionStyle] = useState('')

  const getVisibleItems = useCallback(
    (items: TreeViewItem[]): TreeViewItem[] => {
      let visible: TreeViewItem[] = []
      items.forEach((n) => {
        visible.push(n)
        if (n.children && expandedIds.has(n.id)) {
          visible = [...visible, ...getVisibleItems(n.children)]
        }
      })
      return visible
    },
    [expandedIds],
  )

  useEffect(() => {
    if (!isSelected) {
      setSelectionStyle('')
      return
    }
    const visible = getVisibleItems(allItems)
    const index = visible.findIndex((i) => i.id === item.id)
    const prev = visible[index - 1]
    const next = visible[index + 1]
    const isPrevSelected = prev && selectedIds.has(prev.id)
    const isNextSelected = next && selectedIds.has(next.id)
    const roundTop = !isPrevSelected
    const roundBottom = !isNextSelected
    setSelectionStyle(
      `${roundTop ? 'rounded-t-md' : ''} ${roundBottom ? 'rounded-b-md' : ''}`,
    )
  }, [isSelected, selectedIds, expandedIds, item.id, getVisibleItems, allItems])

  // Find parent
  const getParentItem = (
    id: string,
    items: TreeViewItem[],
  ): TreeViewItem | null => {
    for (const node of items) {
      if (node.children?.some((c) => c.id === id)) return node
      const found = getParentItem(id, node.children || [])
      if (found) return found
    }
    return null
  }

  // Click: select parent (or self if root)
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    const parent = getParentItem(item.id, allItems)
    const targetItem = parent || item
    const targetId = targetItem.id

    if (onAction) {
      onAction('item-clicked', [item]) // raw clicked item
      onAction('select-parent', [targetItem]) // parent (or self if root)
    }

    let newSelection = new Set(selectedIds)
    if (e.ctrlKey || e.metaKey) {
      if (newSelection.has(targetId)) newSelection.delete(targetId)
      else newSelection.add(targetId)
    } else {
      newSelection = new Set([targetId])
    }
    lastSelectedId.current = targetId
    onSelect(newSelection)
  }

  // All descendants incl. self
  const getAllDescendants = (node: TreeViewItem): TreeViewItem[] => {
    const out = [node]
    if (node.children) {
      node.children.forEach((c) => out.push(...getAllDescendants(c)))
    }
    return out
  }

  const handleAccessClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onAccessChange) {
      const current = getCheckState(item, itemMap)
      const newChecked = current === 'checked' ? false : true
      onAccessChange(item, newChecked)
    }
  }

  const renderIcon = () => {
    if (getIcon) return getIcon(item, depth)
    return iconMap[item.type] || iconMap.folder || defaultIconMap.folder
  }

  const getItemPath = (node: TreeViewItem, items: TreeViewItem[]): string => {
    const path: string[] = [node.name]
    const findParent = (current: TreeViewItem, all: TreeViewItem[]) => {
      for (const p of all) {
        if (p.children?.some((c) => c.id === current.id)) {
          path.unshift(p.name)
          findParent(p, all)
          break
        }
        if (p.children) findParent(current, p.children)
      }
    }
    findParent(node, items)
    return path.join('→')
  }

  const getSelectedChildrenCount = (node: TreeViewItem): number => {
    let count = 0
    if (!node.children) return 0
    node.children.forEach((child) => {
      if (selectedIds.has(child.id)) count++
      if (child.children) count += getSelectedChildrenCount(child)
    })
    return count
  }

  const selectedCount =
    (item.children && !isOpen && getSelectedChildrenCount(item)) || null

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div>
          <div
            ref={itemRef}
            data-tree-item
            data-id={item.id}
            data-depth={depth}
            data-folder-closed={item.children && !isOpen}
            className={`select-none cursor-pointer ${
              isSelected
                ? `bg-orange-100 ${selectionStyle}`
                : 'text-neutral-950 dark:text-neutral-50'
            } px-1`}
            style={{ paddingLeft: `${depth * 20}px` }}
            onClick={handleClick}
          >
            <div className="flex items-center h-8">
              {item.children ? (
                <div className="flex items-center gap-2 flex-1 group">
                  <Collapsible
                    open={isOpen}
                    onOpenChange={(open) => onToggleExpand(item.id, open)}
                  >
                    <CollapsibleTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <motion.div
                          initial={false}
                          animate={{ rotate: isOpen ? 90 : 0 }}
                          transition={{ duration: 0.1 }}
                        >
                          <BiChevronRight className="h-4 w-4" />
                        </motion.div>
                      </Button>
                    </CollapsibleTrigger>
                  </Collapsible>

                  {showAccessRights && (
                    <div
                      className="relative flex items-center justify-center w-4 h-4 cursor-pointer hover:opacity-80"
                      onClick={handleAccessClick}
                    >
                      {getCheckState(item, itemMap) === 'checked' && (
                        <div className="w-4 h-4 border border-neutral-200 rounded bg-neutral-900 border-neutral-900 flex items-center justify-center dark:border-neutral-800 dark:bg-neutral-50 dark:border-neutral-50">
                          <svg
                            className="h-3 w-3 text-neutral-50 dark:text-neutral-900"
                            fill="none"
                            viewBox="0 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                      {getCheckState(item, itemMap) === 'unchecked' && (
                        <div className="w-4 h-4 border border-neutral-200 rounded dark:border-neutral-800" />
                      )}
                      {getCheckState(item, itemMap) === 'indeterminate' && (
                        <div className="w-4 h-4 border border-neutral-200 rounded bg-neutral-900 border-neutral-900 flex items-center justify-center dark:border-neutral-800 dark:bg-neutral-50 dark:border-neutral-50">
                          <div className="h-0.5 w-2 bg-neutral-50 dark:bg-neutral-900" />
                        </div>
                      )}
                    </div>
                  )}

                  {renderIcon()}
                  <span className="flex-1">{item.name}</span>

                  {selectedCount !== null && selectedCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="mr-2 bg-blue-100 hover:bg-blue-100"
                    >
                      {selectedCount} selected
                    </Badge>
                  )}

                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 group-hover:opacity-100 opacity-0 items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <BsInfo className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">{item.name}</h4>
                        <div className="text-sm text-neutral-500 space-y-1 dark:text-neutral-400">
                          <div>
                            <span className="font-medium">Type:</span>{' '}
                            {item.type.charAt(0).toUpperCase() +
                              item.type.slice(1).replace('_', '')}
                          </div>
                          <div>
                            <span className="font-medium">ID:</span> {item.id}
                          </div>
                          <div>
                            <span className="font-medium">Location:</span>{' '}
                            {getItemPath(item, allItems)}
                          </div>
                          <div>
                            <span className="font-medium">Items:</span>{' '}
                            {item.children?.length || 0} direct items
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-1 pl-8 group">
                  {showAccessRights && (
                    <div
                      className="relative flex items-center justify-center w-4 h-4 cursor-pointer hover:opacity-80"
                      onClick={handleAccessClick}
                    >
                      {item.checked ? (
                        <div className="w-4 h-4 border border-neutral-200 rounded bg-neutral-900 border-neutral-900 flex items-center justify-center dark:border-neutral-800 dark:bg-neutral-50 dark:border-neutral-50">
                          <svg
                            className="h-3 w-3 text-neutral-50 dark:text-neutral-900"
                            fill="none"
                            viewBox="0 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-4 h-4 border border-neutral-200 rounded dark:border-neutral-800" />
                      )}
                    </div>
                  )}

                  {renderIcon()}
                  <span className="flex-1">{item.name}</span>

                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 group-hover:opacity-100 opacity-0 items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <BsInfo className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">{item.name}</h4>
                        <div className="text-sm text-neutral-500 space-y-1 dark:text-neutral-400">
                          <div>
                            <span className="font-medium">Type:</span>{' '}
                            {item.type.charAt(0).toUpperCase() +
                              item.type.slice(1).replace('_', '')}
                          </div>
                          <div>
                            <span className="font-medium">ID:</span> {item.id}
                          </div>
                          <div>
                            <span className="font-medium">Location:</span>{' '}
                            {getItemPath(item, allItems)}
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              )}
            </div>
          </div>

          {item.children && (
            <Collapsible
              open={isOpen}
              onOpenChange={(open) => onToggleExpand(item.id, open)}
            >
              <AnimatePresence initial={false}>
                {isOpen && (
                  <CollapsibleContent forceMount asChild>
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.05 }}
                    >
                      {item.children?.map((child) => (
                        <TreeItem
                          key={child.id}
                          item={child}
                          depth={depth + 1}
                          selectedIds={selectedIds}
                          lastSelectedId={lastSelectedId}
                          onSelect={onSelect}
                          expandedIds={expandedIds}
                          onToggleExpand={onToggleExpand}
                          getIcon={getIcon}
                          onAction={onAction}
                          onAccessChange={onAccessChange}
                          allItems={allItems}
                          showAccessRights={showAccessRights}
                          itemMap={itemMap}
                          iconMap={iconMap}
                          menuItems={menuItems}
                          getSelectedItems={getSelectedItems}
                        />
                      ))}
                    </motion.div>
                  </CollapsibleContent>
                )}
              </AnimatePresence>
            </Collapsible>
          )}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-64">
        {menuItems?.map((menuItem) => (
          <ContextMenuItem
            key={menuItem.id}
            onClick={() => {
              const items = selectedIds.has(item.id)
                ? getSelectedItems()
                : [item]
              menuItem.action(items)
            }}
          >
            {menuItem.icon && (
              <span className="mr-2 h-4 w-4">{menuItem.icon}</span>
            )}
            {menuItem.label}
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  )
}

export default function TreeView({
  className,
  checkboxLabels = { check: 'Check', uncheck: 'Uncheck' },
  data,
  iconMap,
  searchPlaceholder = 'Search...',
  selectionText = 'selected',
  showExpandAll = true,
  showSeach = true,
  showCheckboxes = false,
  getIcon,
  onSelectionChange,
  onAction,
  onCheckChange,
  menuItems,
}: TreeViewProps) {
  const [currentMousePos, setCurrentMousePos] = useState<number>(0)
  const [dragStart, setDragStart] = useState<number | null>(null)
  const [dragStartPosition, setDragStartPosition] = useState<{
    x: number
    y: number
  } | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [isDragging, setIsDragging] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  const dragRef = useRef<HTMLDivElement>(null)
  const lastSelectedId = useRef<string | null>(null)
  const treeRef = useRef<HTMLDivElement>(null)

  const DRAG_THRESHOLD = 10

  // Stable map
  const itemMap = useMemo(() => buildItemMap(data), [data])

  // Search filter
  const { filteredData, searchExpandedIds } = useMemo(() => {
    if (!searchQuery.trim()) {
      return { filteredData: data, searchExpandedIds: new Set<string>() }
    }
    const q = searchQuery.toLowerCase()
    const newExpandedIds = new Set<string>()

    const matches = (n: TreeViewItem): boolean =>
      n.name.toLowerCase().includes(q) ||
      (n.children ? n.children.some(matches) : false)

    const filterTree = (items: TreeViewItem[]): TreeViewItem[] =>
      items
        .map((n) => {
          if (!n.children) return matches(n) ? n : null
          const filteredChildren = filterTree(n.children)
          if (filteredChildren.length > 0 || matches(n)) {
            newExpandedIds.add(n.id)
            return { ...n, children: filteredChildren }
          }
          return null
        })
        .filter((x): x is TreeViewItem => x !== null)

    return { filteredData: filterTree(data), searchExpandedIds: newExpandedIds }
  }, [data, searchQuery])

  // Expand for search
  useEffect(() => {
    if (searchQuery.trim()) {
      setExpandedIds((prev) => new Set([...prev, ...searchExpandedIds]))
    }
  }, [searchExpandedIds, searchQuery])

  // Click-away clears selection
  useEffect(() => {
    const handleClickAway = (e: MouseEvent) => {
      const target = e.target as Element
      const clickedInside =
        (treeRef.current && treeRef.current.contains(target)) ||
        (dragRef.current && dragRef.current.contains(target)) ||
        target.closest('[role="menu"]') ||
        target.closest('[data-radix-popper-content-wrapper]')
      if (!clickedInside) {
        setSelectedIds(new Set())
        lastSelectedId.current = null
      }
    }
    document.addEventListener('mousedown', handleClickAway)
    return () => document.removeEventListener('mousedown', handleClickAway)
  }, [])

  // Expand/collapse helpers
  const getAllFolderIds = (items: TreeViewItem[]): string[] => {
    let ids: string[] = []
    items.forEach((n) => {
      if (n.children) {
        ids.push(n.id)
        ids = [...ids, ...getAllFolderIds(n.children)]
      }
    })
    return ids
  }
  const handleExpandAll = () => setExpandedIds(new Set(getAllFolderIds(data)))
  const handleCollapseAll = () => setExpandedIds(new Set())

  const collapseRecursively = (node: TreeViewItem, expanded: Set<string>) => {
    expanded.delete(node.id)
    if (node.children)
      node.children.forEach((c) => collapseRecursively(c, expanded))
  }

  const handleToggleExpand = (id: string, isOpen: boolean) => {
    const newExpandedIds = new Set(expandedIds)

    // Find the node being expanded/collapsed
    const findNode = (items: TreeViewItem[]): TreeViewItem | null => {
      for (const node of items) {
        if (node.id === id) return node
        if (node.children) {
          const found = findNode(node.children)
          if (found) return found
        }
      }
      return null
    }

    const currentNode = findNode(data)

    if (currentNode) {
      // Select the CURRENT item being expanded/collapsed
      setSelectedIds(new Set([id]))
      lastSelectedId.current = id

      // Notify via onAction (optional)
      onAction?.('toggle-expand', [currentNode])
    }

    // Find siblings to collapse them
    const findNodeAndSiblings = (
      items: TreeViewItem[],
      parent: TreeViewItem | null = null,
    ): { node: TreeViewItem | null; siblings: TreeViewItem[] } | null => {
      for (const node of items) {
        if (node.id === id) return { node, siblings: parent?.children || items }
        if (node.children) {
          const found = findNodeAndSiblings(node.children, node)
          if (found) return found
        }
      }
      return null
    }

    const result = findNodeAndSiblings(data)
    if (result) {
      const { siblings } = result

      // Collapse all siblings when expanding this node
      siblings.forEach((sibling) => {
        if (sibling.id !== id) collapseRecursively(sibling, newExpandedIds)
      })
    }

    // Expand or collapse the clicked node
    if (isOpen) {
      newExpandedIds.add(id)
    } else {
      collapseRecursively({ id } as TreeViewItem, newExpandedIds)
    }

    setExpandedIds(newExpandedIds)
  }

  // Drag selection
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest('button')) return
    setDragStartPosition({ x: e.clientX, y: e.clientY })
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!(e.buttons & 1)) {
        setIsDragging(false)
        setDragStart(null)
        setDragStartPosition(null)
        return
      }
      if (!dragStartPosition) return

      const deltaX = e.clientX - dragStartPosition.x
      const deltaY = e.clientY - dragStartPosition.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      if (!isDragging) {
        if (distance > DRAG_THRESHOLD) {
          setIsDragging(true)
          setDragStart(dragStartPosition.y)
          if (!e.shiftKey && !e.ctrlKey) {
            setSelectedIds(new Set())
            lastSelectedId.current = null
          }
        }
        return
      }

      if (!dragRef.current) return
      const items = Array.from(
        dragRef.current.querySelectorAll('[data-tree-item]'),
      ) as HTMLElement[]

      const startY = dragStart
      const currentY = e.clientY
      const [selectionStart, selectionEnd] = [
        Math.min(startY || 0, currentY),
        Math.max(startY || 0, currentY),
      ]

      const newSelection = new Set(
        e.shiftKey || e.ctrlKey ? Array.from(selectedIds) : [],
      )

      items.forEach((el) => {
        const rect = el.getBoundingClientRect()
        const top = rect.top
        const bottom = rect.top + rect.height

        if (bottom >= selectionStart && top <= selectionEnd) {
          const id = el.getAttribute('data-id')
          const isClosedFolder =
            el.getAttribute('data-folder-closed') === 'true'
          const parentFolderClosed = el.closest('[data-folder-closed="true"]')
          if (id && (isClosedFolder || !parentFolderClosed))
            newSelection.add(id)
        }
      })

      setSelectedIds(newSelection)
      setCurrentMousePos(e.clientY)
    },
    [isDragging, dragStart, selectedIds, dragStartPosition],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragStart(null)
    setDragStartPosition(null)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('mouseleave', handleMouseUp)
    }
    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseleave', handleMouseUp)
    }
  }, [isDragging, handleMouseUp])

  // Selected items list (for context menu usage)
  const getSelectedItems = useCallback((): TreeViewItem[] => {
    const items: TreeViewItem[] = []
    const visit = (n: TreeViewItem) => {
      if (selectedIds.has(n.id)) items.push(n)
      n.children?.forEach(visit)
    }
    data.forEach(visit)
    return items
  }, [selectedIds, data])

  // Notify parent on selection change ONLY when selectedIds changes (avoid effect loops)
  const selectionCbRef = useRef(onSelectionChange)
  useEffect(() => {
    selectionCbRef.current = onSelectionChange
  }, [onSelectionChange])

  const dataRef = useRef(data)
  useEffect(() => {
    dataRef.current = data
  }, [data])

  useEffect(() => {
    if (!selectionCbRef.current) return
    const items: TreeViewItem[] = []
    const visit = (n: TreeViewItem) => {
      if (selectedIds.has(n.id)) items.push(n)
      n.children?.forEach(visit)
    }
    dataRef.current.forEach(visit)
    selectionCbRef.current(items)
  }, [selectedIds])

  // Effective selection helper for checkbox toolbar
  const getEffectiveSelectedItems = useCallback((): TreeViewItem[] => {
    const selectedItems = getSelectedItems()
    const selectedIdsSet = new Set(selectedItems.map((i) => i.id))
    return selectedItems.filter((i) => {
      if (!i.children) return true
      const hasSelectedChildren = i.children.some((c) =>
        selectedIdsSet.has(c.id),
      )
      return !hasSelectedChildren
    })
  }, [getSelectedItems])

  return (
    <div className="flex gap-4">
      <div
        ref={treeRef}
        className="bg-white p-6 space-y-4 w-full relative dark:bg-neutral-950 dark:border-neutral-800"
      >
        <AnimatePresence mode="wait">
          {selectedIds.size > 0 ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-10 flex items-center justify-between bg-white rounded-lg border border-neutral-200 px-4 dark:bg-neutral-950 dark:border-neutral-800"
            >
              <div
                className="font-medium cursor-pointer flex items-center"
                title="Clear selection"
                onClick={() => {
                  setSelectedIds(new Set())
                  lastSelectedId.current = null
                }}
              >
                <IoIosClose className="h-4 w-4 mr-2" />
                {selectedIds.size} {selectionText}
              </div>

              {showCheckboxes && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const effective = getEffectiveSelectedItems()
                      const process = (n: TreeViewItem) => {
                        onCheckChange?.(n, true)
                        n.children?.forEach(process)
                      }
                      effective.forEach(process)
                    }}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    {checkboxLabels.check}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const effective = getEffectiveSelectedItems()
                      const process = (n: TreeViewItem) => {
                        onCheckChange?.(n, false)
                        n.children?.forEach(process)
                      }
                      effective.forEach(process)
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {checkboxLabels.uncheck}
                  </Button>
                </div>
              )}
            </motion.div>
          ) : showSeach ? (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="h-10 flex items-center gap-2"
            >
              <div className="relative flex-1">
                <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 pl-9"
                />
              </div>
              {showExpandAll && (
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 px-2"
                    onClick={handleExpandAll}
                  >
                    <BiChevronDown className="h-4 w-4 mr-1" />
                    Expand All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 px-2"
                    onClick={handleCollapseAll}
                  >
                    <BiChevronRight className="h-4 w-4 mr-1" />
                    Collapse All
                  </Button>
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div
          ref={dragRef}
          className={cn(
            'rounded-lg bg-white relative select-none dark:bg-neutral-950',
            className,
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        >
          {isDragging && (
            <div
              className="absolute inset-0 bg-blue-500/10 pointer-events-none"
              style={{
                top: Math.min(
                  dragStart || 0,
                  dragStart === null ? 0 : currentMousePos,
                ),
                height: Math.abs(
                  (dragStart || 0) - (dragStart === null ? 0 : currentMousePos),
                ),
              }}
            />
          )}
          {filteredData.map((node) => (
            <TreeItem
              key={node.id}
              item={node}
              selectedIds={selectedIds}
              lastSelectedId={lastSelectedId}
              onSelect={setSelectedIds}
              expandedIds={expandedIds}
              onToggleExpand={handleToggleExpand}
              getIcon={getIcon}
              onAction={onAction}
              onAccessChange={onCheckChange}
              allItems={data}
              showAccessRights={showCheckboxes}
              itemMap={itemMap}
              iconMap={iconMap}
              menuItems={menuItems}
              getSelectedItems={getSelectedItems}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
