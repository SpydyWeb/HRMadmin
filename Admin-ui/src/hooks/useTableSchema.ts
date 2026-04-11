import { useState, useEffect, useRef } from 'react'
import { incentiveService } from '@/services/incentiveService'
import type { QueryFieldConfig, FieldType } from '@/components/query-builder'

/** Raw column descriptor returned by GetTableSchema API */
interface RawColumn {
  columnName?: string
  column_name?: string
  name?: string
  dataType?: string
  data_type?: string
  type?: string
  columnType?: string
  isNullable?: boolean
  is_nullable?: boolean
}

/** Converts raw DB data type string to a QueryFieldConfig FieldType */
function mapDataType(raw: string | undefined): FieldType {
  if (!raw) return 'string'
  const t = raw.toLowerCase().trim()
  if (
    t.includes('int') ||
    t.includes('decimal') ||
    t.includes('numeric') ||
    t.includes('float') ||
    t.includes('real') ||
    t.includes('money') ||
    t.includes('number') ||
    t === 'bit'
  ) {
    return 'number'
  }
  if (
    t.includes('date') ||
    t.includes('time') ||
    t === 'timestamp'
  ) {
    return 'date'
  }
  return 'string'
}

/** Converts a snake_case / PascalCase / camelCase column name to a human-friendly label */
function toFriendlyLabel(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

/** Maps a raw API response to a list of QueryFieldConfig entries */
export function normalizeTableSchema(response: unknown): QueryFieldConfig[] {
  if (!response || typeof response !== 'object') return []

  const body = (response as any)?.responseBody ?? response

  const columns: RawColumn[] =
    body?.columns ??
    body?.schema ??
    body?.fields ??
    body?.columnSchema ??
    (Array.isArray(body) ? body : [])

  if (!Array.isArray(columns) || columns.length === 0) return []

  return columns
    .map((col): QueryFieldConfig | null => {
      const rawName = col.columnName ?? col.column_name ?? col.name
      if (!rawName || typeof rawName !== 'string') return null
      const rawType = col.dataType ?? col.data_type ?? col.type ?? col.columnType
      const fieldType = mapDataType(rawType)
      return {
        name: rawName,
        label: toFriendlyLabel(rawName),
        type: fieldType,
      }
    })
    .filter((f): f is QueryFieldConfig => f !== null)
}

interface TableSchemaState {
  fields: QueryFieldConfig[]
  loading: boolean
  error: string | null
}

/** Module-level cache: tableName → QueryFieldConfig[] */
const schemaCache = new Map<string, QueryFieldConfig[]>()

/**
 * Fetches and caches the column schema for a given table name.
 * Returns fields ready for use in QueryBuilder.
 */
export function useTableSchema(tableName: string): TableSchemaState {
  const [state, setState] = useState<TableSchemaState>({
    fields: schemaCache.get(tableName) ?? [],
    loading: false,
    error: null,
  })

  const latestTableName = useRef(tableName)
  latestTableName.current = tableName

  useEffect(() => {
    if (!tableName) {
      setState({ fields: [], loading: false, error: null })
      return
    }

    // Return cached result immediately
    const cached = schemaCache.get(tableName)
    if (cached) {
      setState({ fields: cached, loading: false, error: null })
      return
    }

    let cancelled = false
    setState((prev) => ({ ...prev, loading: true, error: null }))

    incentiveService
      .getTableSchema(tableName)
      .then((res) => {
        if (cancelled || latestTableName.current !== tableName) return
        const fields = normalizeTableSchema(res)
        schemaCache.set(tableName, fields)
        setState({ fields, loading: false, error: null })
      })
      .catch((err) => {
        if (cancelled || latestTableName.current !== tableName) return
        const message =
          err?.response?.data?.message ??
          err?.response?.data?.errorMessage ??
          err?.message ??
          'Failed to load table schema'
        setState({ fields: [], loading: false, error: message })
      })

    return () => {
      cancelled = true
    }
  }, [tableName])

  return state
}
