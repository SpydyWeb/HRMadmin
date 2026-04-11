import type { FieldType, QueryFieldConfig, QueryGroupNode, QueryRuleNode } from './types'

export function newId(): string {
  return crypto.randomUUID()
}

const DEFAULT_OPS: Record<FieldType, string[]> = {
  string: ['=', '!=', 'LIKE', 'NOT LIKE', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'],
  number: ['=', '!=', '<', '>', '<=', '>=', 'BETWEEN', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'],
  date: ['=', '!=', '<', '>', '<=', '>=', 'BETWEEN', 'IS NULL', 'IS NOT NULL'],
  select: ['=', '!=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'],
}

export function operatorsForField(field: QueryFieldConfig | undefined): string[] {
  if (!field) return ['=']
  if (field.operators?.length) return field.operators
  return DEFAULT_OPS[field.type] ?? DEFAULT_OPS.string
}

/** Narrow operators for the “simple” slab KPI filter (comparisons + BETWEEN, no LIKE/IN). */
const SIMPLE_OPS: Record<FieldType, string[]> = {
  string: ['=', '!='],
  number: ['=', '!=', '<', '>', '<=', '>=', 'BETWEEN'],
  date: ['=', '!=', '<', '>', '<=', '>=', 'BETWEEN'],
  select: ['=', '!='],
}

export function simpleOperatorsForField(field: QueryFieldConfig | undefined): string[] {
  if (!field) return ['=']
  if (field.operators?.length) {
    const allowed = new Set(SIMPLE_OPS[field.type] ?? SIMPLE_OPS.string)
    return field.operators.filter((op) => allowed.has(op))
  }
  return SIMPLE_OPS[field.type] ?? SIMPLE_OPS.string
}

export function createRule(fields: QueryFieldConfig[]): QueryRuleNode {
  const first = fields[0]
  const ops = operatorsForField(first)
  return {
    id: newId(),
    type: 'rule',
    field: first?.name ?? '',
    operator: ops[0] ?? '=',
    value: '',
  }
}

export function createEmptyGroup(fields: QueryFieldConfig[]): QueryGroupNode {
  return {
    id: newId(),
    type: 'group',
    combinator: 'AND',
    children: fields.length ? [createRule(fields)] : [],
  }
}
