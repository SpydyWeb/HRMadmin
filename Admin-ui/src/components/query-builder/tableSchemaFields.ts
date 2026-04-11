import type { IKpi } from '@/models/incentive'
import type { FieldType, QueryFieldConfig } from './types'

/** HMS GetTableSchema row shape (responseBody.tableSchema) */
export interface TableSchemaColumnRow {
  Table?: string
  ColId?: number
  ColumnName?: string
  DataType?: string
  CharacterMaximumLength?: number | null
}

function inferFieldType(dataType: string | undefined): FieldType {
  const t = (dataType ?? '').toLowerCase()
  if (
    t.includes('int') ||
    t === 'serial' ||
    t.includes('numeric') ||
    t.includes('decimal') ||
    t.includes('double') ||
    t.includes('real') ||
    t.includes('float') ||
    t === 'money'
  ) {
    return 'number'
  }
  if (t.includes('date') || t.includes('time')) {
    return 'date'
  }
  return 'string'
}

function shortTableName(full: string | undefined): string {
  if (!full) return ''
  const parts = full.split('.')
  return parts[parts.length - 1] ?? full
}

/**
 * Maps GetTableSchema API payload to QueryFieldConfig for the rule builder.
 * Expects `responseBody.tableSchema` (array of column rows with ColumnName, DataType).
 */
export function queryFieldsFromTableSchemaResponse(payload: unknown): QueryFieldConfig[] {
  const body = (payload as { responseBody?: unknown })?.responseBody ?? payload
  const rows = (body as { tableSchema?: unknown })?.tableSchema
  if (!Array.isArray(rows)) return []

  const seen = new Set<string>()
  const out: QueryFieldConfig[] = []

  for (const raw of rows) {
    const row = raw as TableSchemaColumnRow
    const name = String(row.ColumnName ?? '').trim()
    if (!name || seen.has(name)) continue
    seen.add(name)

    const type = inferFieldType(row.DataType)
    const tbl = shortTableName(row.Table)
    const dt = (row.DataType ?? '').trim()
    const label = tbl ? `${tbl}.${name}${dt ? ` (${dt})` : ''}` : `${name}${dt ? ` (${dt})` : ''}`

    out.push({
      name,
      label,
      type,
    })
  }

  return out
}

/** First KPI data source object is used as DB table name for GetTableSchema. */
export function tableNameForKpi(kpi: IKpi | undefined): string {
  const t = kpi?.dataSources?.[0]?.object?.trim()
  return t || 'channel_master'
}
