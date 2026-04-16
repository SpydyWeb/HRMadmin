import { useEffect, useState } from 'react'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { useNavigate, useSearch } from '@tanstack/react-router'

import Button from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { incentiveService } from '@/services/incentiveService'
import { showToast } from '@/components/ui/sonner'
import { NOTIFICATION_CONSTANTS } from '@/utils/constant'

type Aggregation = 'SUM' | 'COUNT' | 'DISTINCT_COUNT' | 'AVG'

type DataSource = {
  id: string
  /** Persisted `dataSourceId` from GetKpiDetails; use 0 for new rows on create/update */
  serverDataSourceId?: number
  objectId: string
  objectDisplayName: string
  aggregation: Aggregation
  fieldId: string
  fieldDisplayName: string
  filters: Array<{
    id: string
    fieldId: string
    displayName: string
    operator:
      | 'EQUALS'
      | 'NOT_EQUALS'
      | 'LESS_THAN'
      | 'LESS_THAN_OR_EQUAL'
      | 'GREATER_THAN'
      | 'GREATER_THAN_OR_EQUAL'
      | 'ADD'
      | 'SUBTRACT'
      | 'MULTIPLY'
      | 'DIVIDE'
    value: string
    valueType: 'Text' | 'Number' | 'Date' | 'List'
  }>
}

type TimeWindow = 'PROGRAM_DURATION' | 'CUSTOM_RANGE' | 'ROLLING_WINDOW'

type KpiLabelValue = { label: string; value: string }

/** Parse API envelope: responseBody.kpiObjects / kpiFields as { label, value }[] */
function extractLabelValueList(payload: unknown): KpiLabelValue[] {
  const body = (payload as any)?.responseBody ?? (payload as any)?.data ?? payload
  const candidate =
    (body as any)?.kpiObjects ??
    (body as any)?.kpiFields ??
    (body as any)?.items ??
    (body as any)?.list ??
    (body as any)?.objects ??
    (body as any)?.fields

  if (!Array.isArray(candidate)) return []

  return candidate
    .map((x: unknown): KpiLabelValue | null => {
      if (typeof x === 'string') {
        const s = x.trim()
        return s ? { label: s, value: s } : null
      }
      if (x && typeof x === 'object') {
        const o = x as Record<string, unknown>
        const value = String(o.value ?? o.fieldName ?? o.name ?? '').trim()
        const label = String(o.label ?? o.title ?? o.name ?? value).trim()
        if (!value && !label) return null
        return { label: label || value, value: value || label }
      }
      return null
    })
    .filter((x): x is KpiLabelValue => x != null)
}

type TableSchemaColumn = {
  ColumnName?: string
  DataType?: string
  CharacterMaximumLength?: number | null
}

function extractTableSchemaColumns(payload: unknown): TableSchemaColumn[] {
  const body = (payload as any)?.responseBody ?? (payload as any)?.data ?? payload
  const schema = (body as any)?.tableSchema
  return Array.isArray(schema) ? (schema as TableSchemaColumn[]) : []
}

function mapDbTypeToValueType(dbType: string | undefined): DataSource['filters'][number]['valueType'] {
  const t = String(dbType ?? '').toLowerCase()
  if (!t) return 'Text'
  if (t.includes('date') || t.includes('time')) return 'Date'
  if (t.includes('int') || t.includes('numeric') || t.includes('decimal') || t.includes('real') || t.includes('double')) {
    return 'Number'
  }
  return 'Text'
}

const AGGREGATIONS: Array<{ id: Aggregation; title: string; subtitle: string }> = [
  { id: 'SUM', title: 'SUM', subtitle: 'Sum of numeric field' },
  { id: 'COUNT', title: 'COUNT', subtitle: 'Count of records' },
  { id: 'DISTINCT_COUNT', title: 'DISTINCT COUNT', subtitle: 'Unique count' },
  { id: 'AVG', title: 'AVG', subtitle: 'Average value' },
]

function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`
}

function generateKpiCode() {
  const token = crypto.randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()
  return `KPI_CODE_${token}`
}

export default function KpiBuilderScreen() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { kpiId?: string | number; kpiName?: string }
  const [editingKpiId, setEditingKpiId] = useState(0)
  const [loadingKpi, setLoadingKpi] = useState(false)

  const [kpiName, setKpiName] = useState('')
  const [kpiCode, setKpiCode] = useState('')
  const [description, setDescription] = useState('')


  const [objectOptions, setObjectOptions] = useState<KpiLabelValue[]>([])
  const [objectsLoading, setObjectsLoading] = useState(false)
  const [objectsError, setObjectsError] = useState<string>('')

  const [fieldsByObject, setFieldsByObject] = useState<Record<string, KpiLabelValue[]>>({})
  const [fieldsLoadingByObject, setFieldsLoadingByObject] = useState<Record<string, boolean>>({})
  const [fieldsErrorByObject, setFieldsErrorByObject] = useState<Record<string, string>>({})
  const [fieldTypeByObject, setFieldTypeByObject] = useState<Record<string, Record<string, string>>>({})

  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      id: newId('ds'),
      objectId: '',
      objectDisplayName: '',
      aggregation: 'SUM',
      fieldId: '',
      fieldDisplayName: '',
      filters: [],
    },
  ])
  const [activeDataSourceId, setActiveDataSourceId] = useState<string>(() => {
    const first = crypto.randomUUID()
    return `ds_${first}`
  })
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('PROGRAM_DURATION')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [rollingDays, setRollingDays] = useState<number | ''>('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')

  useEffect(() => {
    const raw = search?.kpiId
    if (raw === undefined || raw === null || raw === '') {
      setEditingKpiId(0)
      return
    }
    const n = typeof raw === 'string' ? parseInt(raw, 10) : Number(raw)
    if (!Number.isFinite(n) || n <= 0) {
      setEditingKpiId(0)
      return
    }
    setEditingKpiId(n)
    const nameFromUrl = search?.kpiName
    if (typeof nameFromUrl === 'string' && nameFromUrl.trim()) {
      setKpiName(nameFromUrl.trim())
    }
  }, [search?.kpiId, search?.kpiName])

  useEffect(() => {
    let cancelled = false
    if (!editingKpiId) return

    ;(async () => {
      setLoadingKpi(true)
      try {
        const res: any = await incentiveService.getKpiDetails(editingKpiId)
        const kpi =
          res?.responseBody?.kpiDetail ??
          res?.responseBody?.kpi ??
          res?.responseBody?.kpiDetails ??
          res?.responseBody?.kpiDetailsByProgram ??
          res?.responseBody ??
          res
        if (!kpi || cancelled) return

        setKpiName(String(kpi.kpiName ?? kpi.name ?? '').trim())
        setKpiCode(String(kpi.kpiCode ?? kpi.code ?? '').trim())
        setDescription(String(kpi.description ?? '').trim())
       

        const tw = String(kpi.timeWindowType ?? '').toLowerCase()
        if (tw.includes('custom')) setTimeWindow('CUSTOM_RANGE')
        else if (tw.includes('rolling')) setTimeWindow('ROLLING_WINDOW')
        else setTimeWindow('PROGRAM_DURATION')

        const toDateOnly = (v: any) => {
          if (!v) return ''
          const d = new Date(String(v))
          if (Number.isNaN(d.getTime())) return ''
          return d.toISOString().slice(0, 10)
        }
        const customStartRaw =
          kpi.timeWindowCustomStart ??
          kpi.customStart ??
          kpi.customStartDate ??
          kpi.timeWindowStart ??
          kpi.startDate ??
          kpi.fromDate
        const customEndRaw =
          kpi.timeWindowCustomEnd ??
          kpi.customEnd ??
          kpi.customEndDate ??
          kpi.timeWindowEnd ??
          kpi.endDate ??
          kpi.toDate
        setCustomStart(toDateOnly(customStartRaw))
        setCustomEnd(toDateOnly(customEndRaw))
        setRollingDays(
          kpi.timeWindowRollingDays == null || kpi.timeWindowRollingDays === ''
            ? ''
            : Number(kpi.timeWindowRollingDays),
        )

        const ds = Array.isArray(kpi.dataSources) ? kpi.dataSources : []
        if (ds.length) {
          const parseSelectionConfiguration = (raw: any) => {
            if (!raw) return null
            if (typeof raw === 'string') {
              try {
                return JSON.parse(raw)
              } catch {
                return null
              }
            }
            if (typeof raw === 'object') return raw
            return null
          }

          setDataSources(
            ds.map((x: any) => ({
              id: newId('ds'),
              serverDataSourceId: (() => {
                const raw = x?.dataSourceId
                if (raw == null || String(raw).trim() === '') return undefined
                const n = Number(raw)
                return Number.isFinite(n) ? n : undefined
              })(),
              objectId: (() => {
                const sc = parseSelectionConfiguration(x.selectionConfiguration)
                return String(
                  sc?.object?.id ??
                    x.objectId ??
                    x.objectCode ??
                    x.objectName ??
                    x.object ??
                    '',
                )
              })(),
              objectDisplayName: (() => {
                const sc = parseSelectionConfiguration(x.selectionConfiguration)
                return String(
                  sc?.object?.displayName ??
                    x.objectDisplayName ??
                    x.objectName ??
                    x.object ??
                    '',
                )
              })(),
              aggregation: (() => {
                const sc = parseSelectionConfiguration(x.selectionConfiguration)
                return String(
                  sc?.aggregation?.type ??
                    x.aggregationType ??
                    x.aggregation ??
                    'SUM',
                ) as Aggregation
              })(),
              fieldId: (() => {
                const sc = parseSelectionConfiguration(x.selectionConfiguration)
                return String(
                  sc?.field?.id ??
                    x.fieldId ??
                    x.fieldCode ??
                    x.fieldName ??
                    x.field ??
                    '',
                )
              })(),
              fieldDisplayName: (() => {
                const sc = parseSelectionConfiguration(x.selectionConfiguration)
                return String(
                  sc?.field?.displayName ??
                    x.fieldDisplayName ??
                    x.fieldName ??
                    x.field ??
                    '',
                )
              })(),
              filters: (() => {
                const sc = parseSelectionConfiguration(x.selectionConfiguration)
                const rawFilters = Array.isArray(sc?.filters)
                  ? sc.filters
                  : Array.isArray(x.filters)
                    ? x.filters
                    : []

                return rawFilters.map((f: any) => ({
                  id: newId('flt'),
                  fieldId: String(f.fieldId ?? ''),
                  displayName: String(f.displayName ?? f.fieldName ?? ''),
                  operator: String(f.operator ?? 'EQUALS'),
                  value: Array.isArray(f.value) ? f.value.join(',') : String(f.value ?? ''),
                  valueType: String(f.valueType ?? 'Text'),
                }))
              })(),
            })),
          )
        }
      } catch (e: any) {
        const msg = e?.message || 'Failed to load KPI details'
        showToast(NOTIFICATION_CONSTANTS.ERROR, msg)
      } finally {
        if (!cancelled) setLoadingKpi(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [editingKpiId])

  useEffect(() => {
    let cancelled = false

    async function loadObjects() {
      setObjectsLoading(true)
      setObjectsError('')
      try {
        const json = (await incentiveService.getKpiObjects()) as unknown
        const list = extractLabelValueList(json)
        if (!cancelled) {
          setObjectOptions(list)
        }
      } catch (e) {
        if (!cancelled) setObjectsError(e instanceof Error ? e.message : 'Failed to load objects')
      } finally {
        if (!cancelled) setObjectsLoading(false)
      }
    }

    void loadObjects()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    // Keep active id valid when dataSources changes.
    if (dataSources.length === 0) return
    if (!dataSources.some((d) => d.id === activeDataSourceId)) {
      setActiveDataSourceId(dataSources[0].id)
    }
  }, [activeDataSourceId, dataSources])

  const getObjectKey = (ds: Pick<DataSource, 'objectId' | 'objectDisplayName'>) => ds.objectId || ds.objectDisplayName

  const getFieldsForObject = (objectKey: string) => fieldsByObject[objectKey] ?? []
  const getFieldTypeForObject = (objectKey: string, fieldId: string) => fieldTypeByObject[objectKey]?.[fieldId]

  const loadFieldsForObject = async (tableName: string) => {
    const trimmed = tableName.trim()
    if (!trimmed) return
    if (fieldsByObject[trimmed]?.length) return
    if (fieldsLoadingByObject[trimmed]) return

    setFieldsLoadingByObject((prev) => ({ ...prev, [trimmed]: true }))
    setFieldsErrorByObject((prev) => ({ ...prev, [trimmed]: '' }))

    try {
      const json = (await incentiveService.getTableSchema(trimmed)) as unknown
      const cols = extractTableSchemaColumns(json)
      const typeMap: Record<string, string> = {}
      const list: KpiLabelValue[] = cols
        .map((c) => {
          const name = String(c?.ColumnName ?? '').trim()
          if (!name) return null
          const dt = String(c?.DataType ?? '').trim()
          if (dt) typeMap[name] = dt
          const label = dt ? `${name} (${dt})` : name
          return { label, value: name }
        })
        .filter((x): x is KpiLabelValue => x != null)

      setFieldsByObject((prev) => ({ ...prev, [trimmed]: list }))
      setFieldTypeByObject((prev) => ({ ...prev, [trimmed]: typeMap }))
    } catch (e) {
      setFieldsErrorByObject((prev) => ({
        ...prev,
        [trimmed]: e instanceof Error ? e.message : 'Failed to load table schema',
      }))
    } finally {
      setFieldsLoadingByObject((prev) => ({ ...prev, [trimmed]: false }))
    }
  }

  const updateDataSource = (id: string, updates: Partial<DataSource>) => {
    setDataSources((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)))
  }

  const addDataSource = () => {
    const created: DataSource = {
      id: newId('ds'),
      objectId: '',
      objectDisplayName: '',
      aggregation: 'SUM',
      fieldId: '',
      fieldDisplayName: '',
      filters: [],
    }
    setDataSources((prev) => [...prev, created])
    setActiveDataSourceId(created.id)
  }

  const removeDataSource = (dsId: string) => {
    setDataSources((prev) => {
      if (prev.length <= 1) return prev
      const next = prev.filter((d) => d.id !== dsId)
      if (next.length === 0) return prev

      setActiveDataSourceId((curr) => {
        if (curr !== dsId) return curr
        return next[0]?.id ?? curr
      })

      return next
    })
  }

  const addFilter = (dsId: string) => {
    setDataSources((prev) =>
      prev.map((d) =>
        d.id === dsId
          ? {
              ...d,
              filters: [
                ...d.filters,
                {
                  id: newId('flt'),
                  fieldId: '',
                  displayName: '',
                  operator: 'EQUALS',
                  value: '',
                  valueType: 'Text',
                },
              ],
            }
          : d,
      ),
    )
  }

  const removeFilter = (dsId: string, filterId: string) => {
    setDataSources((prev) =>
      prev.map((d) => (d.id === dsId ? { ...d, filters: d.filters.filter((f) => f.id !== filterId) } : d)),
    )
  }

  const resetForm = () => {
    const ds: DataSource = {
      id: newId('ds'),
      objectId: '',
      objectDisplayName: '',
      aggregation: 'SUM',
      fieldId: '',
      fieldDisplayName: '',
      filters: [],
    }
    setEditingKpiId(0)
    setKpiName('')
    setKpiCode('')
    setDescription('')
 
    setDataSources([ds])
    setActiveDataSourceId(ds.id)
    setTimeWindow('PROGRAM_DURATION')
    setCustomStart('')
    setCustomEnd('')
    setRollingDays('')
    setFieldsByObject({})
    setFieldsLoadingByObject({})
    setFieldsErrorByObject({})
    setFieldTypeByObject({})
    setSaveError('')
  }

  const buildPayload = () => {
    const timeWindowType =
      timeWindow === 'CUSTOM_RANGE'
        ? 'Custom'
        : timeWindow === 'ROLLING_WINDOW'
          ? 'Rolling'
          : 'Program Duration'

    return {
      kpiId: editingKpiId,
      kpiName,
      kpiCode,
      description,
      timeWindowType,
      timeWindowCustomStart: timeWindow === 'CUSTOM_RANGE' && customStart ? customStart : null,
      timeWindowCustomEnd: timeWindow === 'CUSTOM_RANGE' && customEnd ? customEnd : null,
      timeWindowRollingDays: timeWindow === 'ROLLING_WINDOW' && rollingDays !== '' ? Number(rollingDays) : null,
      dataSources: dataSources.map((ds) => {
        const filters = ds.filters
          .filter((f) => f.fieldId && f.operator)
          .map((f) => {
            const trimmed = String(f.value ?? '').trim()
            const normalizedValue =
              f.valueType === 'List'
                ? trimmed
                    .split(',')
                    .map((x) => x.trim())
                    .filter(Boolean)
                : f.valueType === 'Number'
                  ? (trimmed === '' ? null : Number(trimmed))
                  : trimmed

            return {
              fieldId: f.fieldId,
              displayName: f.displayName,
              operator: f.operator,
              value: normalizedValue,
              valueType: f.valueType,
            }
          })

        const selectionConfiguration = JSON.stringify({
          object: {
            id: ds.objectId,
            displayName: ds.objectDisplayName,
          },
          aggregation: {
            type: ds.aggregation,
            field: ds.fieldDisplayName || ds.fieldId,
          },
          field: {
            id: ds.fieldId,
            displayName: ds.fieldDisplayName || ds.fieldId,
          },
          filters,
        })

        return {
          dataSourceId: ds.serverDataSourceId ?? 0,
          selectionConfiguration,
        }
      }),
    }
  }

  const onSave = async () => {
    setSaveError('')
    setSaveSuccess('')
    setSaving(true)
    try {
      const payload = buildPayload()
      const res = (await incentiveService.upsertKpi(payload)) as unknown
      const code = (res as any)?.responseHeader?.errorCode
      const msg = (res as any)?.responseHeader?.errorMessage
      if (code && code !== 1101) {
        throw new Error(typeof msg === 'string' && msg ? msg : 'Failed to save KPI')
      }
      resetForm()
      const successMsg = typeof msg === 'string' && msg ? msg : 'Saved'
      setSaveSuccess(successMsg)
      showToast(
        NOTIFICATION_CONSTANTS.SUCCESS,
        editingKpiId > 0 ? 'KPI updated successfully' : 'KPI saved',
        { description: successMsg },
      )
      navigate({ to: '/search/incentive/kpis' as any })
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Failed to save KPI'
      setSaveError(errMsg)
      showToast(NOTIFICATION_CONSTANTS.ERROR, 'Save failed', { description: errMsg })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen w-full">
      <div className="p-4 w-full">
        <div className="w-full">
        
          <div className="space-y-4 w-full">
            {/* KPI Name */}
            <Card className="rounded-xl border border-neutral-200 shadow-sm">
              <CardContent className="px-5 pb-5 pt-5">
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                {editingKpiId > 0 ? (
                  <p className="mb-4 rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-900">
                    Editing existing KPI{' '}
                    <span className="font-mono font-semibold">ID {editingKpiId}</span>
                  </p>
                ) : null}
                <Input
                  label="KPI Name"
                  name="kpiName"
                  variant="standardone"
                  placeholder="e.g. Total Premium by Sales Personnel"
                  value={kpiName}
                  onChange={(e) => setKpiName(e.target.value)}
                  disabled={editingKpiId > 0 || loadingKpi}
                  className="!h-10 w-full rounded-sm"
                />
                {editingKpiId > 0 ? (
                  <p className="mt-1 text-xs text-neutral-500">KPI Name cannot be changed while editing.</p>
                ) : null}
                <div className="flex items-end gap-2">
                  <Input
                    label="KPI Code"
                    name="kpiCode"
                    variant="standardone"
                    placeholder="e.g. KPI_TOT_PREM_2024"
                    value={kpiCode}
                    onChange={(e) => setKpiCode(e.target.value)}
                    className="!h-10 w-full rounded-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10"
                    onClick={() => setKpiCode(generateKpiCode())}
                  >
                    Generate
                  </Button>
                </div>
                </div>
                <div className="mt-3">
                  <Input
                    label="Description"
                    name="description"
                    variant="standardone"
                    placeholder="Describe what this KPI calculates"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="!h-10 w-full rounded-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Sources */}
            <Card className="rounded-xl border border-neutral-200 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-3 px-5 pb-3 pt-5">
                <div className="min-w-0">
                  <CardTitle className="text-base">Data Sources</CardTitle>
                  <p className="mt-1 text-xs text-neutral-500">
                    Add one or more object types to aggregate data from. Each data source contributes an independent
                    metric to the KPI.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<FiPlus className="h-4 w-4" />}
                  onClick={addDataSource}
                >
                  Add Data Source
                </Button>
              </CardHeader>

              <CardContent className="px-5 pb-5">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[14rem_minmax(0,1fr)]">
                  {/* Left list */}
                  <div className="rounded-xl border border-neutral-200 bg-white p-2">
                    <p className="px-2 pb-2 text-xs font-semibold text-neutral-600">Data Sources</p>
                    <div className="space-y-1">
                      {dataSources.map((ds, idx) => {
                        const active = ds.id === activeDataSourceId
                        return (
                          <button
                            key={ds.id}
                            type="button"
                            onClick={() => setActiveDataSourceId(ds.id)}
                            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                              active ? 'bg-neutral-900 text-white' : 'bg-white hover:bg-neutral-50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold">Data Source {idx + 1}</span>
                              <span className={`text-[11px] ${active ? 'text-neutral-200' : 'text-neutral-500'}`}>
                                {ds.objectDisplayName ? ds.objectDisplayName : 'Not set'}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Right details */}
                  {(() => {
                    const ds = dataSources.find((d) => d.id === activeDataSourceId) ?? dataSources[0]
                    if (!ds) return null
                    const idx = dataSources.findIndex((d) => d.id === ds.id)
                    return (
                      <div className="rounded-xl border border-neutral-200 bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-neutral-800">Data Source {idx + 1}</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            icon={<FiTrash2 className="h-4 w-4" />}
                            onClick={() => removeDataSource(ds.id)}
                            disabled={dataSources.length <= 1}
                          >
                            Delete
                          </Button>
                        </div>

                        <div className="mt-4 space-y-4">
                          {/* Object */}
                          <div>
                            <Label className="text-xs font-semibold text-neutral-600">Object</Label>
                            <Select
                              value={ds.objectId || '__none__'}
                              onValueChange={(v) => {
                                const nextObjectId = v === '__none__' ? '' : v
                                const nextObjectDisplayName =
                                  nextObjectId ? objectOptions.find((o) => o.value === nextObjectId)?.label ?? '' : ''
                                updateDataSource(ds.id, {
                                  objectId: nextObjectId,
                                  objectDisplayName: nextObjectDisplayName,
                                  fieldId: '',
                                  fieldDisplayName: '',
                                })
                                if (nextObjectId) void loadFieldsForObject(nextObjectId)
                              }}
                            >
                              <SelectTrigger className="mt-2 !h-10 w-full rounded-sm border border-gray-400 bg-white px-3 py-2 text-sm">
                                <SelectValue placeholder="Select object..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">{objectsLoading ? 'Loading...' : 'Select object...'}</SelectItem>
                                {objectOptions.map((o) => (
                                  <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {objectsError ? <p className="mt-2 text-xs text-red-600">{objectsError}</p> : null}
                          </div>

                          {/* Aggregation */}
                          <div>
                            <Label className="text-xs font-semibold text-neutral-600">Aggregation</Label>
                            <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
                              {AGGREGATIONS.map((a) => {
                                const active = ds.aggregation === a.id
                                return (
                                  <button
                                    key={a.id}
                                    type="button"
                                    onClick={() => updateDataSource(ds.id, { aggregation: a.id })}
                                    className={`rounded-lg border px-3 py-3 text-left transition ${
                                      active
                                        ? 'border-teal-300 bg-teal-50'
                                        : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'
                                    }`}
                                  >
                                    <p className="text-xs font-semibold text-neutral-800">{a.title}</p>
                                    <p className="mt-0.5 text-[11px] text-neutral-500">{a.subtitle}</p>
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          {/* Field */}
                          <div>
                            <Label className="text-xs font-semibold text-neutral-600">Field</Label>
                            <Select
                              value={ds.fieldId || '__none__'}
                              onValueChange={(v) => {
                                const nextFieldId = v === '__none__' ? '' : v
                                const fieldOptions = getFieldsForObject(getObjectKey(ds))
                                const nextFieldDisplayName =
                                  nextFieldId ? fieldOptions.find((f) => f.value === nextFieldId)?.label ?? '' : ''
                                updateDataSource(ds.id, {
                                  fieldId: nextFieldId,
                                  fieldDisplayName: nextFieldDisplayName,
                                })
                              }}
                            >
                              <SelectTrigger className="mt-2 !h-10 w-full rounded-sm border border-gray-400 bg-white px-3 py-2 text-sm">
                                <SelectValue placeholder={ds.objectId ? 'Select field...' : 'No compatible fields'} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">
                                  {!ds.objectId
                                    ? 'Select an object first'
                                    : fieldsLoadingByObject[getObjectKey(ds)]
                                      ? 'Loading fields...'
                                      : 'Select field...'}
                                </SelectItem>
                                {getFieldsForObject(getObjectKey(ds)).map((f) => (
                                  <SelectItem key={f.value} value={f.value}>
                                    {f.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {getObjectKey(ds) && fieldsErrorByObject[getObjectKey(ds)] ? (
                              <p className="mt-2 text-xs text-red-600">{fieldsErrorByObject[getObjectKey(ds)]}</p>
                            ) : null}
                          </div>

                          {/* Preview table */}
                          {ds.objectDisplayName && ds.fieldId ? (
                            <div className="rounded-lg border border-neutral-200 bg-white">
                              <div className="border-b border-neutral-200 px-3 py-2">
                                <p className="text-xs font-semibold text-neutral-700">Selected Configuration</p>
                              </div>
                              <div className="p-3">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Object</TableHead>
                                      <TableHead>Aggregation</TableHead>
                                      <TableHead>Field</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    <TableRow>
                                      <TableCell>
                                        {ds.objectDisplayName || ds.objectId}
                                      </TableCell>
                                      <TableCell>{ds.aggregation}</TableCell>
                                      <TableCell>
                                        {getFieldsForObject(getObjectKey(ds)).find((f) => f.value === ds.fieldId)
                                          ?.label ?? ds.fieldDisplayName ?? ds.fieldId}
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          ) : null}

                          {/* Filters */}
                          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <Label className="text-xs font-semibold text-neutral-600">Filters</Label>
                              <Button
                                variant="outline"
                                size="sm"
                                icon={<FiPlus className="h-4 w-4" />}
                                onClick={() => addFilter(ds.id)}
                              >
                                Add Filter
                              </Button>
                            </div>
                            {ds.filters.length === 0 ? (
                              <p className="mt-3 text-center text-xs text-neutral-400">
                                No filters. Click &quot;Add Filter&quot; to begin.
                              </p>
                            ) : (
                              <div className="mt-3 space-y-2">
                                <div className="grid grid-cols-[1fr_12rem_10rem_1fr_auto] gap-2 px-1 text-[11px] font-semibold text-neutral-500">
                                  <div>Field name</div>
                                  <div>Operator</div>
                                  <div>Value type</div>
                                  <div>Value</div>
                                  <div />
                                </div>

                                {ds.filters.map((f) => {
                                  const objectKey = getObjectKey(ds)
                                  const fieldOptions = getFieldsForObject(objectKey)
                                  const dt = objectKey && f.fieldId ? getFieldTypeForObject(objectKey, f.fieldId) : undefined
                                  const mergedTypeLabel = dt ? `${mapDbTypeToValueType(dt)} (${dt})` : f.valueType
                                  return (
                                    <div
                                      key={f.id}
                                      className="grid grid-cols-[1fr_12rem_10rem_1fr_auto] items-center gap-2 rounded-md border border-neutral-200 bg-white p-2"
                                    >
                                      <Select
                                        value={f.fieldId || '__none__'}
                                        onValueChange={(v) => {
                                          const nextFieldId = v === '__none__' ? '' : v
                                          const nextDisplayName =
                                            nextFieldId
                                              ? fieldOptions.find((x) => x.value === nextFieldId)?.label ?? ''
                                              : ''
                                          const nextDt =
                                            objectKey && nextFieldId ? getFieldTypeForObject(objectKey, nextFieldId) : undefined
                                          const nextValueType = mapDbTypeToValueType(nextDt)
                                          // Important: update in a single state write, otherwise the
                                          // second update can overwrite the first (losing the selected field).
                                          const nextFilters = ds.filters.map((x) =>
                                            x.id === f.id
                                              ? {
                                                  ...x,
                                                  fieldId: nextFieldId,
                                                  displayName: nextDisplayName,
                                                  valueType: nextValueType,
                                                  value: '',
                                                }
                                              : x,
                                          )
                                          updateDataSource(ds.id, { filters: nextFilters })
                                        }}
                                      >
                                        <SelectTrigger className="!h-9 w-full rounded-sm border border-gray-300 bg-white px-2 py-1 text-xs">
                                          <SelectValue placeholder="Select field..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="__none__">Select field...</SelectItem>
                                          {fieldOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                              {opt.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>

                                      <Select
                                        value={f.operator}
                                        onValueChange={(v) => {
                                          updateDataSource(ds.id, {
                                            filters: ds.filters.map((x) => (x.id === f.id ? { ...x, operator: v as any } : x)),
                                          })
                                        }}
                                      >
                                        <SelectTrigger className="!h-9 w-full rounded-sm border border-gray-300 bg-white px-2 py-1 text-xs">
                                          <SelectValue placeholder="Operator" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="EQUALS">=</SelectItem>
                                          <SelectItem value="NOT_EQUALS">!=</SelectItem>
                                          <SelectItem value="LESS_THAN">&lt;</SelectItem>
                                          <SelectItem value="LESS_THAN_OR_EQUAL">&lt;=</SelectItem>
                                          <SelectItem value="GREATER_THAN">&gt;</SelectItem>
                                          <SelectItem value="GREATER_THAN_OR_EQUAL">&gt;=</SelectItem>
                                          <SelectItem value="ADD">+</SelectItem>
                                          <SelectItem value="SUBTRACT">-</SelectItem>
                                          <SelectItem value="MULTIPLY">*</SelectItem>
                                          <SelectItem value="DIVIDE">/</SelectItem>
                                        </SelectContent>
                                      </Select>

                                      <div className="flex !h-9 w-full items-center rounded-sm border border-gray-300 bg-neutral-50 px-2 text-xs text-neutral-700">
                                        {mergedTypeLabel || 'Text'}
                                      </div>

                                      <Input
                                        label=""
                                        name="filterValue"
                                        variant="standardone"
                                        type={f.valueType === 'Date' ? 'date' : 'text'}
                                        placeholder={f.valueType === 'List' ? 'Comma separated (e.g. North,West)' : 'Value'}
                                        value={f.value}
                                        onChange={(e) => {
                                          updateDataSource(ds.id, {
                                            filters: ds.filters.map((x) =>
                                              x.id === f.id ? { ...x, value: e.target.value } : x,
                                            ),
                                          })
                                        }}
                                        className="!h-9 w-full rounded-sm"
                                      />

                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeFilter(ds.id, f.id)}
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>
            {/* Time Window */}
            <Card className="rounded-xl border border-neutral-200 shadow-sm">
              <CardHeader className="px-5 pb-3 pt-5">
                <CardTitle className="text-base">Time Window</CardTitle>
                <p className="mt-1 text-xs text-neutral-500">Define the time range for the KPI calculation</p>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setTimeWindow('PROGRAM_DURATION')}
                    className={`rounded-lg border px-4 py-4 text-left transition ${
                      timeWindow === 'PROGRAM_DURATION'
                        ? 'border-indigo-200 bg-indigo-50'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'
                    }`}
                  >
                    <p className="text-sm font-semibold text-neutral-800">Program Duration</p>
                    <p className="mt-0.5 text-xs text-neutral-500">Entire incentive program period</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTimeWindow('ROLLING_WINDOW')}
                    className={`rounded-lg border px-4 py-4 text-left transition ${
                      timeWindow === 'ROLLING_WINDOW'
                        ? 'border-indigo-200 bg-indigo-50'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'
                    }`}
                  >
                    <p className="text-sm font-semibold text-neutral-800">Rolling Window</p>
                    <p className="mt-0.5 text-xs text-neutral-500">Last N days from today</p>
                  </button>
                </div>

                {timeWindow === 'ROLLING_WINDOW' ? (
                  <div className="mt-4">
                    <Input
                      label="Rolling days"
                      name="rollingDays"
                      variant="standardone"
                      placeholder="e.g. 30"
                      value={rollingDays}
                      onChange={(e) => {
                        const v = e.target.value
                        setRollingDays(v === '' ? '' : Number(v))
                      }}
                      className="!h-10 w-full rounded-sm"
                    />
                  </div>
                ) : null}
              </CardContent>
            </Card>
                <div className="flex justify-end">
               <Button onClick={onSave} disabled={saving} className="w-95 text-end">
                  {saving
                    ? 'Saving...'
                    : editingKpiId > 0
                      ? 'Update KPI Definition'
                      : 'Save KPI Definition'}
                </Button>
                </div>
                {saveError ? <p className="text-xs text-red-600">{saveError}</p> : null}
                {saveSuccess ? <p className="text-xs text-emerald-700">{saveSuccess}</p> : null}
          </div>

    
        </div>
      </div>
    </div>
  )
}

