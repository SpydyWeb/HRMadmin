import type { QueryFieldConfig, QueryGroupNode, QueryNode, QueryRuleNode } from './types'
import { isGroup, isRule } from './types'

function quoteString(s: string): string {
  return `'${String(s).replace(/'/g, "''")}'`
}

function formatLiteral(
  raw: string | number | null | undefined,
  fieldType: QueryFieldConfig['type'] | undefined,
): string {
  if (raw === null || raw === undefined || raw === '') return "''"
  if (fieldType === 'number') {
    const n = Number(raw)
    return Number.isFinite(n) ? String(n) : quoteString(String(raw))
  }
  if (fieldType === 'date') {
    const s = String(raw).trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `DATE '${s}'`
    return quoteString(s)
  }
  return quoteString(String(raw))
}

function parseInList(raw: string): string[] {
  return raw
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
}

function ruleToSql(
  rule: QueryRuleNode,
  fieldMap: Map<string, QueryFieldConfig>,
): string | null {
  const fieldCfg = fieldMap.get(rule.field)
  const ident = rule.field ? quoteIdent(rule.field) : ''
  const op = rule.operator.toUpperCase()
  const ft = fieldCfg?.type

  if (!rule.field) return null

  if (op === 'IS NULL') return `${ident} IS NULL`
  if (op === 'IS NOT NULL') return `${ident} IS NOT NULL`

  if (op === 'BETWEEN') {
    const a = formatLiteral(rule.value ?? null, ft)
    const b = formatLiteral(rule.value2 ?? null, ft)
    return `${ident} BETWEEN ${a} AND ${b}`
  }

  if (op === 'IN' || op === 'NOT IN') {
    const raw = String(rule.value ?? '')
    const parts = parseInList(raw)
    const list = parts.length
      ? parts.map((p) => formatLiteral(p, ft === 'number' ? 'number' : 'string')).join(', ')
      : "''"
    return `${ident} ${op} (${list})`
  }

  if (op === 'LIKE' || op === 'NOT LIKE') {
    return `${ident} ${op} ${formatLiteral(String(rule.value ?? ''), 'string')}`
  }

  const rhs = formatLiteral(rule.value ?? null, ft)
  return `${ident} ${rule.operator} ${rhs}`
}

/** Safe-ish identifier: quote if needed */
export function quoteIdent(name: string): string {
  if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) return name
  return `"${name.replace(/"/g, '""')}"`
}

function nodeToSql(node: QueryNode, fieldMap: Map<string, QueryFieldConfig>): string | null {
  if (isRule(node)) {
    return ruleToSql(node, fieldMap)
  }
  const g = node
  const parts = g.children
    .map((c) => nodeToSql(c, fieldMap))
    .filter((s): s is string => s != null && s.trim() !== '')
  if (parts.length === 0) return null
  if (parts.length === 1) return parts[0]
  const joined = parts.join(` ${g.combinator} `)
  return g.children.length > 1 ? `(${joined})` : joined
}

/**
 * Builds a WHERE-fragment style SQL string from the query tree.
 * Returns empty string if nothing valid is configured.
 */
export function queryGroupToSql(
  root: QueryGroupNode,
  fields: QueryFieldConfig[],
): string {
  const fieldMap = new Map(fields.map((f) => [f.name, f]))
  const sql = nodeToSql(root, fieldMap)
  return sql ?? ''
}
