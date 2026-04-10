import React from 'react'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import type { QueryGroup as QueryGroupType, QueryRule as QueryRuleType, FieldDef, Combinator } from './types'
import { createRule, createGroup } from './types'
import QueryRuleComponent from './QueryRule'

interface QueryGroupProps {
  group: QueryGroupType
  fields: FieldDef[]
  depth: number
  onChange: (updated: QueryGroupType) => void
  onRemove?: () => void
  canRemove?: boolean
}

const COMBINATOR_COLORS: Record<Combinator, string> = {
  AND: 'border-l-blue-400',
  OR: 'border-l-amber-400',
}

const QueryGroup: React.FC<QueryGroupProps> = ({
  group,
  fields,
  depth,
  onChange,
  onRemove,
  canRemove = false,
}) => {
  // ── Combinator toggle ──────────────────────────────────────────────────────
  const toggleCombinator = () => {
    onChange({ ...group, combinator: group.combinator === 'AND' ? 'OR' : 'AND' })
  }

  // ── Add a new rule ─────────────────────────────────────────────────────────
  const addRule = () => {
    const defaultField = fields.length > 0 ? fields[0].name : ''
    onChange({ ...group, rules: [...group.rules, createRule(defaultField)] })
  }

  // ── Add a nested group ─────────────────────────────────────────────────────
  const addGroup = () => {
    onChange({ ...group, rules: [...group.rules, createGroup(group.combinator)] })
  }

  // ── Update a specific child ────────────────────────────────────────────────
  const updateChild = (idx: number, updated: QueryRuleType | QueryGroupType) => {
    const rules = [...group.rules]
    rules[idx] = updated
    onChange({ ...group, rules })
  }

  // ── Remove a specific child ────────────────────────────────────────────────
  const removeChild = (idx: number) => {
    onChange({ ...group, rules: group.rules.filter((_, i) => i !== idx) })
  }

  const borderColor = COMBINATOR_COLORS[group.combinator]

  return (
    <div
      className={`rounded-lg border border-neutral-200 bg-neutral-50 p-3 ${depth > 0 ? `border-l-4 ${borderColor}` : ''}`}
    >
      {/* Group header: combinator toggle + group actions */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {/* AND / OR toggle */}
        <div className="flex items-center overflow-hidden rounded-md border border-neutral-300 text-xs font-semibold">
          <button
            type="button"
            onClick={() => group.combinator !== 'AND' && toggleCombinator()}
            className={`px-3 py-1.5 transition ${
              group.combinator === 'AND'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-neutral-500 hover:bg-neutral-100'
            }`}
          >
            AND
          </button>
          <button
            type="button"
            onClick={() => group.combinator !== 'OR' && toggleCombinator()}
            className={`px-3 py-1.5 transition ${
              group.combinator === 'OR'
                ? 'bg-amber-500 text-white'
                : 'bg-white text-neutral-500 hover:bg-neutral-100'
            }`}
          >
            OR
          </button>
        </div>

        {/* Add rule */}
        <button
          type="button"
          onClick={addRule}
          className="flex items-center gap-1 rounded border border-blue-300 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
        >
          <FiPlus className="h-3 w-3" />
          Add Rule
        </button>

        {/* Add nested group (max depth 3 to keep the UI manageable and avoid runaway nesting) */}
        {depth < 3 && (
          <button
            type="button"
            onClick={addGroup}
            className="flex items-center gap-1 rounded border border-purple-300 bg-purple-50 px-2.5 py-1.5 text-xs font-medium text-purple-700 transition hover:bg-purple-100"
          >
            <FiPlus className="h-3 w-3" />
            Add Group
          </button>
        )}

        {/* Remove this group */}
        {canRemove && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            title="Remove group"
            className="ml-auto flex-shrink-0 rounded p-1 text-neutral-400 transition hover:bg-red-50 hover:text-red-500"
          >
            <FiTrash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Rules / nested groups */}
      <div className="space-y-2">
        {group.rules.map((child, idx) => {
          if (child.type === 'rule') {
            return (
              <QueryRuleComponent
                key={child.id}
                rule={child}
                fields={fields}
                onChange={(updates) =>
                  updateChild(idx, { ...child, ...updates } as QueryRuleType)
                }
                onRemove={() => removeChild(idx)}
                canRemove={group.rules.length > 1}
              />
            )
          }
          // nested group
          return (
            <QueryGroup
              key={child.id}
              group={child}
              fields={fields}
              depth={depth + 1}
              onChange={(updated) => updateChild(idx, updated)}
              onRemove={() => removeChild(idx)}
              canRemove
            />
          )
        })}
      </div>
    </div>
  )
}

export default QueryGroup
