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

/** Expected shape of the GetTableSchema API response body */
interface TableSchemaResponseBody {
  columns?: RawColumn[]
  schema?: RawColumn[]
  fields?: RawColumn[]
  columnSchema?: RawColumn[]
}

/** Top-level API response wrapper */
interface TableSchemaApiResponse {
  responseBody?: TableSchemaResponseBody | RawColumn[]
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
    t === 'bit' // SQL bit (0/1) treated as number since QueryBuilder has no boolean type
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

  const typed = response as TableSchemaApiResponse
  const body = typed.responseBody ?? (response as TableSchemaResponseBody | RawColumn[])

  let columns: RawColumn[]
  if (Array.isArray(body)) {
    columns = body
  } else {
    const b = body as TableSchemaResponseBody
    columns = b.columns ?? b.schema ?? b.fields ?? b.columnSchema ?? []
  }

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

/** Reusable shape for errors returned by API call rejections */
interface ApiError {
  response?: { data?: { message?: string; errorMessage?: string } }
  message?: string
}

/** Maximum number of table schemas to keep in the module-level cache */
const CACHE_MAX_SIZE = 50

/** Module-level LRU cache: tableName → QueryFieldConfig[] */
class LruCache {
  private map = new Map<string, QueryFieldConfig[]>()
  private maxSize: number

  constructor(maxSize: number) {
    this.maxSize = maxSize
  }

  get(key: string): QueryFieldConfig[] | undefined {
    if (!this.map.has(key)) return undefined
    // Move to end (most recently used)
    const value = this.map.get(key)!
    this.map.delete(key)
    this.map.set(key, value)
    return value
  }

  set(key: string, value: QueryFieldConfig[]): void {
    if (this.map.has(key)) this.map.delete(key)
    else if (this.map.size >= this.maxSize) {
      // Evict the least recently used entry (first in map)
      const firstKey = this.map.keys().next().value
      if (firstKey !== undefined) this.map.delete(firstKey)
    }
    this.map.set(key, value)
  }
}

const schemaCache = new LruCache(CACHE_MAX_SIZE)

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
      .catch((err: ApiError) => {
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
