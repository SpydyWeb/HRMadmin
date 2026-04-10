import React from 'react'
import { FiTrash2 } from 'react-icons/fi'
import type { QueryRule as QueryRuleType, FieldDef, Operator } from './types'
import { OPERATORS } from './types'

interface QueryRuleProps {
  rule: QueryRuleType
  fields: FieldDef[]
  onChange: (updates: Partial<QueryRuleType>) => void
  onRemove: () => void
  canRemove: boolean
}

const QueryRule: React.FC<QueryRuleProps> = ({ rule, fields, onChange, onRemove, canRemove }) => {
  const selectedOperator = OPERATORS.find((op) => op.value === rule.operator)
  const arity = selectedOperator?.arity ?? 1

  const handleOperatorChange = (op: Operator) => {
    const meta = OPERATORS.find((o) => o.value === op)
    onChange({ operator: op, value: meta?.arity === 0 ? '' : rule.value, valueTo: '' })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 shadow-sm">
      {/* Field dropdown */}
      <select
        value={rule.field}
        onChange={(e) => onChange({ field: e.target.value })}
        className="min-w-[120px] flex-1 rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm text-neutral-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="" disabled>
          Select field…
        </option>
        {fields.map((f) => (
          <option key={f.name} value={f.name}>
            {f.label}
          </option>
        ))}
      </select>

      {/* Operator dropdown */}
      <select
        value={rule.operator}
        onChange={(e) => handleOperatorChange(e.target.value as Operator)}
        className="min-w-[140px] rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm text-neutral-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {OPERATORS.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>

      {/* Value input(s) */}
      {arity === 1 && (
        <input
          type="text"
          value={rule.value}
          onChange={(e) => onChange({ value: e.target.value })}
          placeholder="value"
          className="min-w-[100px] flex-1 rounded border border-neutral-300 px-2 py-1.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      )}
      {arity === 2 && (
        <>
          <input
            type="text"
            value={rule.value}
            onChange={(e) => onChange({ value: e.target.value })}
            placeholder="from"
            className="min-w-[80px] flex-1 rounded border border-neutral-300 px-2 py-1.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-xs font-medium text-neutral-500">and</span>
          <input
            type="text"
            value={rule.valueTo}
            onChange={(e) => onChange({ valueTo: e.target.value })}
            placeholder="to"
            className="min-w-[80px] flex-1 rounded border border-neutral-300 px-2 py-1.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </>
      )}
      {arity === 0 && (
        <span className="text-xs italic text-neutral-400">(no value needed)</span>
      )}

      {/* Remove rule button */}
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          title="Remove rule"
          className="ml-auto flex-shrink-0 rounded p-1 text-neutral-400 transition hover:bg-red-50 hover:text-red-500"
        >
          <FiTrash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

export default QueryRule
