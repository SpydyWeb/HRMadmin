import { FiPlus } from 'react-icons/fi'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import Button from '@/components/ui/button'
import type { QueryCombinator, QueryFieldConfig, QueryGroupNode } from './types'
import { isRule } from './types'
import { Rule } from './Rule'
import { createRule, newId } from './defaults'

interface GroupProps {
  node: QueryGroupNode
  fields: QueryFieldConfig[]
  depth: number
  isRoot: boolean
  onPatch: (id: string, patch: Partial<QueryGroupNode>) => void
  onRulePatch: (id: string, patch: import('./types').QueryRuleNode | Partial<import('./types').QueryRuleNode>) => void
  onRemoveNode: (id: string) => void
  onAddRule: (groupId: string) => void
  onAddGroup: (groupId: string) => void
}

export function Group({
  node,
  fields,
  depth,
  isRoot,
  onPatch,
  onRulePatch,
  onRemoveNode,
  onAddRule,
  onAddGroup,
}: GroupProps) {
  const nestClass =
    depth > 0
      ? 'border border-violet-200/80 bg-violet-50/40 pl-3 pr-2 py-2 rounded-lg'
      : ''

  return (
    <div className={`space-y-2 ${nestClass}`}>
      <div className="flex flex-wrap items-center gap-2">
        {!isRoot && (
          <Label className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
            Group
          </Label>
        )}
        <Select
          value={node.combinator}
          onValueChange={(v: QueryCombinator) => onPatch(node.id, { combinator: v })}
        >
          <SelectTrigger className="h-8 w-[88px] text-xs font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AND">AND</SelectItem>
            <SelectItem value="OR">OR</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={() => onAddRule(node.id)}
          >
            <FiPlus className="h-3.5 w-3.5" />
            Rule
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={() => onAddGroup(node.id)}
          >
            <FiPlus className="h-3.5 w-3.5" />
            Group
          </Button>
          {!isRoot && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-red-500 hover:text-red-700"
              onClick={() => onRemoveNode(node.id)}
            >
              Remove group
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {node.children.length === 0 && (
          <p className="text-xs text-neutral-400">No rules yet. Add a rule or nested group.</p>
        )}
        {node.children.map((child) => (
          <div key={child.id}>
            {isRule(child) ? (
              <Rule
                rule={child}
                fields={fields}
                onChange={(patch) => onRulePatch(child.id, patch)}
                onRemove={() => onRemoveNode(child.id)}
                canRemove={!(isRoot && node.children.length <= 1)}
              />
            ) : (
              <Group
                node={child}
                fields={fields}
                depth={depth + 1}
                isRoot={false}
                onPatch={onPatch}
                onRulePatch={onRulePatch}
                onRemoveNode={onRemoveNode}
                onAddRule={onAddRule}
                onAddGroup={onAddGroup}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function createNestedGroup(fields: QueryFieldConfig[]): QueryGroupNode {
  return {
    id: newId(),
    type: 'group',
    combinator: 'AND',
    children: [createRule(fields)],
  }
}
