// ─── Query Builder Types ──────────────────────────────────────────────────────

export type Combinator = 'AND' | 'OR'

export type Operator =
  | '='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'BETWEEN'
  | 'LIKE'
  | 'NOT LIKE'
  | 'IN'
  | 'IS NULL'
  | 'IS NOT NULL'

export interface FieldDef {
  name: string
  label: string
  type?: 'text' | 'number' | 'date'
  description?: string
}

export interface QueryRule {
  id: string
  type: 'rule'
  field: string
  operator: Operator
  value: string
  valueTo: string // used for BETWEEN (second bound)
}

export interface QueryGroup {
  id: string
  type: 'group'
  combinator: Combinator
  rules: Array<QueryRule | QueryGroup>
}

// ─── Operator metadata ────────────────────────────────────────────────────────

export interface OperatorMeta {
  value: Operator
  label: string
  /** How many value inputs the operator needs: 0 = none, 1 = single, 2 = between */
  arity: 0 | 1 | 2
}

export const OPERATORS: OperatorMeta[] = [
  { value: '=', label: '= equals', arity: 1 },
  { value: '!=', label: '≠ not equals', arity: 1 },
  { value: '>', label: '> greater than', arity: 1 },
  { value: '>=', label: '≥ greater than or equal', arity: 1 },
  { value: '<', label: '< less than', arity: 1 },
  { value: '<=', label: '≤ less than or equal', arity: 1 },
  { value: 'BETWEEN', label: 'between', arity: 2 },
  { value: 'LIKE', label: 'like', arity: 1 },
  { value: 'NOT LIKE', label: 'not like', arity: 1 },
  { value: 'IN', label: 'in (comma-sep)', arity: 1 },
  { value: 'IS NULL', label: 'is null', arity: 0 },
  { value: 'IS NOT NULL', label: 'is not null', arity: 0 },
]

// ─── Default example fields ───────────────────────────────────────────────────

export const DEFAULT_FIELDS: FieldDef[] = [
  { name: 'age', label: 'Age', type: 'number' },
  { name: 'city', label: 'City', type: 'text' },
  { name: 'premium', label: 'Premium', type: 'number' },
  { name: 'policy_type', label: 'Policy Type', type: 'text' },
]

// ─── Factory helpers ──────────────────────────────────────────────────────────

export const createRule = (field = ''): QueryRule => ({
  id: crypto.randomUUID(),
  type: 'rule',
  field,
  operator: '=',
  value: '',
  valueTo: '',
})

export const createGroup = (combinator: Combinator = 'AND'): QueryGroup => ({
  id: crypto.randomUUID(),
  type: 'group',
  combinator,
  rules: [createRule()],
})
