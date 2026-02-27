import React, { useState } from 'react'
import {
    FiChevronRight,
    FiChevronDown,
    FiUser,
    FiFolder,
} from 'react-icons/fi'
import { BiFolderOpen } from 'react-icons/bi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import Button from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

type TreeNode = {
    id: string
    name: string
    type: string
    children?: TreeNode[]

    // ✅ Add this
    fieldList?: any[]
}


interface Props {
    data: TreeNode[]
    onSelect?: (node: TreeNode) => void
}

export default function FieldTreeView({ data, onSelect }: Props) {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null)

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const newSet = new Set(prev)
            newSet.has(id) ? newSet.delete(id) : newSet.add(id)
            return newSet
        })
    }

    const renderNode = (node: TreeNode, level = 0): React.ReactNode => {
        const hasChildren = !!node.children?.length
        const isExpanded = expandedIds.has(node.id)
        const isSelected = selectedNode?.id === node.id

        return (
            <div key={node.id}>
                <div
                    onClick={() => {
                        setSelectedNode(node)

                        // call parent
                        if (onSelect) {
                            onSelect(node)
                        }
                    }}
                    className={cn(
                        'flex items-center gap-1 py-2 px-1 rounded-md cursor-pointer transition-colors group',
                        'hover:bg-muted/50',
                        isSelected && 'bg-primary/10 border-l-2 border-primary'
                    )}
                    style={{ paddingLeft: `${level * 12}px` }}
                >

                    {/* Expand Button */}
                    {hasChildren ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 hover:bg-muted"
                            onClick={(e) => {
                                e.stopPropagation()
                                toggleExpand(node.id)
                            }}
                        >
                            {isExpanded ? (
                                <FiChevronDown className="h-3 w-3" />
                            ) : (
                                <FiChevronRight className="h-3 w-3" />
                            )}
                        </Button>
                    ) : (
                        <span className="w-5" />
                    )}

                    {/* Folder / User Icon */}
                    {hasChildren ? (
                        isExpanded ? (
                            <BiFolderOpen className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        ) : (
                            <FiFolder className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        )
                    ) : (
                        <FiUser className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}

                    {/* Name */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="text-sm truncate flex-1 cursor-default">
                                    {node.name}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                {node.name}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Type Badge (shows on hover or selected) */}
                    <Badge
                        variant="secondary"
                        className={cn(
                            'text-xs px-1.5 py-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity',
                            isSelected && 'opacity-100'
                        )}
                    >
                        {node.type}
                    </Badge>

                    {/* Children Count */}
                    {hasChildren && (
                        <Badge
                            variant="outline"
                            className="text-xs px-1.5 py-0 flex-shrink-0"
                        >
                            {node.children!.length}
                        </Badge>
                    )}
                </div>

                {/* Render Children */}
                {hasChildren &&
                    isExpanded &&
                    node.children!.map(child =>
                        renderNode(child, level + 1)
                    )}
            </div>
        )
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="border-b shrink-0">
                <CardTitle className="text-base">
                    Hierarchy Navigator
                </CardTitle>
            </CardHeader>

            <CardContent className="p-2 flex-1 overflow-y-auto">
                {data.map(node => renderNode(node))}
            </CardContent>
        </Card>
    )
}
