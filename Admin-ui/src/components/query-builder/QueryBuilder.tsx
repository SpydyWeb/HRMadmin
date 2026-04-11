import { useMemo } from 'react'
import { FiCode } from 'react-icons/fi'
import type { QueryFieldConfig, QueryGroupNode, QueryRuleNode } from './types'
import { isRule } from './types'
import { Group, createNestedGroup } from './Group'
import { createRule } from './defaults'
import { appendChildToGroup, mutateNodeById, removeNodeById } from './tree'
import { queryGroupToSql } from './sql'

interface QueryBuilderProps {
  fields: QueryFieldConfig[]
  value: QueryGroupNode
  onChange: (next: QueryGroupNode) => void
  /** Called with generated SQL whenever the tree changes */
  onSqlChange?: (sql: string) => void
  title?: string
  description?: string
  className?: string
  /**
   * `simple` — slab “Selected KPI” filters: flat rules only (AND/OR), common comparisons,
   * no nested groups, no SQL preview panel.
   */
  variant?: 'default' | 'simple'
}

export function QueryBuilder({
  fields,
  value,
  onChange,
  onSqlChange,
  title = 'Query builder',
  description,
  className = '',
  variant = 'default',
}: QueryBuilderProps) {
  const simple = variant === 'simple'
  const sql = useMemo(() => queryGroupToSql(value, fields), [value, fields])

  const emit = (next: QueryGroupNode) => {
    onChange(next)
    onSqlChange?.(queryGroupToSql(next, fields))
  }

  const handleRulePatch = (id: string, patch: Partial<QueryRuleNode>) => {
    emit(
      mutateNodeById(value, id, (n) => {
        if (!isRule(n)) return n
        return { ...n, ...patch }
      }),
    )
  }

  const handleGroupPatch = (id: string, patch: Partial<QueryGroupNode>) => {
    emit(
      mutateNodeById(value, id, (n) => {
        if (n.type !== 'group') return n
        return { ...n, ...patch }
      }),
    )
  }

  const handleRemove = (id: string) => {
    if (id === value.id) return
    emit(removeNodeById(value, id))
  }

  const handleAddRule = (groupId: string) => {
    emit(appendChildToGroup(value, groupId, createRule(fields)))
  }

  const handleAddGroup = (groupId: string) => {
    emit(appendChildToGroup(value, groupId, createNestedGroup(fields)))
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {(title || description) && (
        <div>
          {title && <p className="text-sm font-semibold text-neutral-800">{title}</p>}
          {description && <p className="mt-0.5 text-xs text-neutral-500">{description}</p>}
        </div>
      )}

      <Group
        node={value}
        fields={fields}
        depth={0}
        isRoot
        allowNestedGroups={!simple}
        operatorSet={simple ? 'simple' : 'default'}
        onPatch={handleGroupPatch}
        onRulePatch={handleRulePatch}
        onRemoveNode={handleRemove}
        onAddRule={handleAddRule}
        onAddGroup={handleAddGroup}
      />

      {!simple && (
        <div className="rounded-lg border border-slate-200 bg-slate-950/95 p-3 text-slate-100 shadow-inner">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-300">
            <FiCode className="h-3.5 w-3.5" />
            Generated SQL (preview)
          </div>
          <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed text-emerald-300/95">
            {sql.trim() ? sql : '— add rules to see SQL —'}
          </pre>
        </div>
      )}
    </div>
  )
}

export default QueryBuilder
