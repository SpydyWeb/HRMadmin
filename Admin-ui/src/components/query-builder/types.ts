/** Combinator for nested rule groups */
export type QueryCombinator = 'AND' | 'OR'

export type FieldType = 'string' | 'number' | 'select' | 'date'

/** Dynamic field definition (typically from API) */
export interface QueryFieldConfig {
  name: string
  label: string
  type: FieldType
  /** When set, overrides default operators for this type */
  operators?: string[]
  /** Options for `select` fields */
  options?: Array<{ value: string; label: string }>
}

export type QueryRuleValue = string | number | null

export interface QueryRuleNode {
  id: string
  type: 'rule'
  field: string
  operator: string
  value?: QueryRuleValue
  /** Second bound for BETWEEN */
  value2?: QueryRuleValue
}

export interface QueryGroupNode {
  id: string
  type: 'group'
  combinator: QueryCombinator
  children: QueryNode[]
}

export type QueryNode = QueryRuleNode | QueryGroupNode

export function isRule(n: QueryNode): n is QueryRuleNode {
  return n.type === 'rule'
}

export function isGroup(n: QueryNode): n is QueryGroupNode {
  return n.type === 'group'
}
