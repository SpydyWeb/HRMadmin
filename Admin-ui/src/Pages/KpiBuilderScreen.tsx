import { useEffect, useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import { useNavigate, useSearch } from '@tanstack/react-router'

import Button from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
  object: string
  aggregation: Aggregation
  field: string
  filters: Array<{ id: string; label: string }>
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

const AGGREGATIONS: Array<{ id: Aggregation; title: string; subtitle: string }> = [
  { id: 'SUM', title: 'SUM', subtitle: 'Sum of numeric field' },
  { id: 'COUNT', title: 'COUNT', subtitle: 'Count of records' },
  { id: 'DISTINCT_COUNT', title: 'DISTINCT COUNT', subtitle: 'Unique count' },
  { id: 'AVG', title: 'AVG', subtitle: 'Average value' },
]

function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`
}

export default function KpiBuilderScreen() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { kpiId?: string | number; kpiName?: string }
  const [editingKpiId, setEditingKpiId] = useState(0)
  const [loadingKpi, setLoadingKpi] = useState(false)

  const [kpiName, setKpiName] = useState('')
  const [kpiCode, setKpiCode] = useState('')
  const [description, setDescription] = useState('')
  const [unitType, setUnitType] = useState('')

  const [objectOptions, setObjectOptions] = useState<KpiLabelValue[]>([])
  const [objectsLoading, setObjectsLoading] = useState(false)
  const [objectsError, setObjectsError] = useState<string>('')

  const [fieldsByObject, setFieldsByObject] = useState<Record<string, KpiLabelValue[]>>({})
  const [fieldsLoadingByObject, setFieldsLoadingByObject] = useState<Record<string, boolean>>({})
  const [fieldsErrorByObject, setFieldsErrorByObject] = useState<Record<string, string>>({})

  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      id: newId('ds'),
      object: '',
      aggregation: 'SUM',
      field: '',
      filters: [],
    },
  ])
  const [activeDataSourceId, setActiveDataSourceId] = useState<string>(() => {
    const first = crypto.randomUUID()
    return `ds_${first}`
  })
  const [groupByTeam, setGroupByTeam] = useState(false)
  const [groupByRegion, setGroupByRegion] = useState(false)
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('PROGRAM_DURATION')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [rollingDays, setRollingDays] = useState<number | ''>('')
  const [sampleCode, setSampleCode] = useState('')
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
        setUnitType(String(kpi.unitType ?? '').trim())

        const grouping: string[] = Array.isArray(kpi.groupingTypes) ? kpi.groupingTypes : []
        setGroupByTeam(grouping.some((x) => String(x).toLowerCase() === 'team'))
        setGroupByRegion(grouping.some((x) => String(x).toLowerCase() === 'region'))

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
          setDataSources(
            ds.map((x: any) => ({
              id: newId('ds'),
              object: String(x.objectName ?? x.object ?? ''),
              aggregation: String(x.aggregationType ?? x.aggregation ?? 'SUM') as Aggregation,
              field: String(x.fieldName ?? x.field ?? ''),
              filters: [],
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

  const getFieldsForObject = (objectValue: string) => fieldsByObject[objectValue] ?? []

  const loadFieldsForObject = async (objectName: string) => {
    const trimmed = objectName.trim()
    if (!trimmed) return
    if (fieldsByObject[trimmed]?.length) return
    if (fieldsLoadingByObject[trimmed]) return

    setFieldsLoadingByObject((prev) => ({ ...prev, [trimmed]: true }))
    setFieldsErrorByObject((prev) => ({ ...prev, [trimmed]: '' }))

    try {
      const json = (await incentiveService.getKpiFields(trimmed)) as unknown
      const list = extractLabelValueList(json)
      setFieldsByObject((prev) => ({ ...prev, [trimmed]: list }))
    } catch (e) {
      setFieldsErrorByObject((prev) => ({
        ...prev,
        [trimmed]: e instanceof Error ? e.message : 'Failed to load fields',
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
      object: '',
      aggregation: 'SUM',
      field: '',
      filters: [],
    }
    setDataSources((prev) => [...prev, created])
    setActiveDataSourceId(created.id)
  }

  const addFilter = (dsId: string) => {
    setDataSources((prev) =>
      prev.map((d) =>
        d.id === dsId
          ? {
              ...d,
              filters: [...d.filters, { id: newId('flt'), label: 'New filter' }],
            }
          : d,
      ),
    )
  }

  const resetForm = () => {
    const ds: DataSource = {
      id: newId('ds'),
      object: '',
      aggregation: 'SUM',
      field: '',
      filters: [],
    }
    setEditingKpiId(0)
    setKpiName('')
    setKpiCode('')
    setDescription('')
    setUnitType('')
    setDataSources([ds])
    setActiveDataSourceId(ds.id)
    setGroupByTeam(false)
    setGroupByRegion(false)
    setTimeWindow('PROGRAM_DURATION')
    setCustomStart('')
    setCustomEnd('')
    setRollingDays('')
    setSampleCode('')
    setFieldsByObject({})
    setFieldsLoadingByObject({})
    setFieldsErrorByObject({})
    setSaveError('')
  }

  const buildPayload = () => {
    const groupingTypes: string[] = ['Sales Personnel ID']
    if (groupByTeam) groupingTypes.push('Team')
    if (groupByRegion) groupingTypes.push('Region')

    const timeWindowType =
      timeWindow === 'CUSTOM_RANGE' ? 'Custom' : timeWindow === 'ROLLING_WINDOW' ? 'Rolling' : 'Program Duration'

    return {
      kpiId: editingKpiId,
      kpiName,
      kpiCode,
      description,
      unitType,
      groupingTypes,
      timeWindowType,
      timeWindowCustomStart: timeWindow === 'CUSTOM_RANGE' && customStart ? new Date(customStart).toISOString() : null,
      timeWindowCustomEnd: timeWindow === 'CUSTOM_RANGE' && customEnd ? new Date(customEnd).toISOString() : null,
      timeWindowRollingDays: timeWindow === 'ROLLING_WINDOW' && rollingDays !== '' ? Number(rollingDays) : null,
      dataSources: dataSources.map((ds) => ({
        dataSourceId: 0,
        objectName: ds.object,
        aggregationType: ds.aggregation,
        fieldName: ds.field,
      })),
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
      if (editingKpiId > 0) {
        navigate({ to: '/search/incentive/kpis' as any })
      } else {
        navigate({
          to: '/search/incentive/kpi-builder',
          search: {},
          replace: true,
        })
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Failed to save KPI'
      setSaveError(errMsg)
      showToast(NOTIFICATION_CONSTANTS.ERROR, 'Save failed', { description: errMsg })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="p-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
          {/* Left column */}
          <div className="space-y-4">
            {/* KPI Name */}
            <Card className="rounded-xl border border-neutral-200 shadow-sm">
              <CardContent className="px-5 pb-5 pt-5">
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
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Input
                    label="KPI Code"
                    name="kpiCode"
                    variant="standardone"
                    placeholder="e.g. KPI_TOT_PREM_2024"
                    value={kpiCode}
                    onChange={(e) => setKpiCode(e.target.value)}
                    className="!h-10 w-full rounded-sm"
                  />
                  <Input
                    label="Unit Type"
                    name="unitType"
                    variant="standardone"
                    placeholder="e.g. Currency"
                    value={unitType}
                    onChange={(e) => setUnitType(e.target.value)}
                    className="!h-10 w-full rounded-sm"
                  />
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
                        const objLabel = objectOptions.find((o) => o.value === ds.object)?.label
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
                                {ds.object ? objLabel ?? ds.object : 'Not set'}
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
                        <p className="text-sm font-semibold text-neutral-800">Data Source {idx + 1}</p>

                        <div className="mt-4 space-y-4">
                          {/* Object */}
                          <div>
                            <Label className="text-xs font-semibold text-neutral-600">Object</Label>
                            <Select
                              value={ds.object || '__none__'}
                              onValueChange={(v) => {
                                const nextObject = v === '__none__' ? '' : v
                                updateDataSource(ds.id, { object: nextObject, field: '' })
                                if (nextObject) void loadFieldsForObject(nextObject)
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
                              value={ds.field || '__none__'}
                              onValueChange={(v) => updateDataSource(ds.id, { field: v === '__none__' ? '' : v })}
                            >
                              <SelectTrigger className="mt-2 !h-10 w-full rounded-sm border border-gray-400 bg-white px-3 py-2 text-sm">
                                <SelectValue placeholder={ds.object ? 'Select field...' : 'No compatible fields'} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">
                                  {!ds.object
                                    ? 'Select an object first'
                                    : fieldsLoadingByObject[ds.object]
                                      ? 'Loading fields...'
                                      : 'Select field...'}
                                </SelectItem>
                                {getFieldsForObject(ds.object).map((f) => (
                                  <SelectItem key={f.value} value={f.value}>
                                    {f.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {ds.object && fieldsErrorByObject[ds.object] ? (
                              <p className="mt-2 text-xs text-red-600">{fieldsErrorByObject[ds.object]}</p>
                            ) : null}
                          </div>

                          {/* Preview table */}
                          {ds.object && ds.field ? (
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
                                        {objectOptions.find((o) => o.value === ds.object)?.label ?? ds.object}
                                      </TableCell>
                                      <TableCell>{ds.aggregation}</TableCell>
                                      <TableCell>
                                        {getFieldsForObject(ds.object).find((f) => f.value === ds.field)?.label ??
                                          ds.field}
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
                                {ds.filters.map((f) => (
                                  <div
                                    key={f.id}
                                    className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-700"
                                  >
                                    {f.label}
                                  </div>
                                ))}
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

            {/* Grouping */}
            <Card className="rounded-xl border border-neutral-200 shadow-sm">
              <CardHeader className="px-5 pb-3 pt-5">
                <CardTitle className="text-base">Grouping</CardTitle>
                <p className="mt-1 text-xs text-neutral-500">Define how results are grouped</p>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg border border-teal-200 bg-teal-50 px-3 py-3">
                    <div>
                      <p className="text-sm font-semibold text-teal-800">Sales Personnel ID</p>
                      <p className="text-[11px] text-teal-700">Mandatory grouping — always applied</p>
                    </div>
                    <span className="rounded-md border border-teal-200 bg-teal-100 px-2 py-1 text-[11px] font-semibold text-teal-700">
                      Locked
                    </span>
                  </div>

                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-3 hover:bg-neutral-50">
                    <Checkbox checked={groupByTeam} onCheckedChange={(v) => setGroupByTeam(Boolean(v))} />
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">Team</p>
                      <p className="text-[11px] text-neutral-500">Group by team name</p>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-3 hover:bg-neutral-50">
                    <Checkbox checked={groupByRegion} onCheckedChange={(v) => setGroupByRegion(Boolean(v))} />
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">Region</p>
                      <p className="text-[11px] text-neutral-500">Group by geographic region</p>
                    </div>
                  </label>
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
                    onClick={() => setTimeWindow('CUSTOM_RANGE')}
                    className={`rounded-lg border px-4 py-4 text-left transition ${
                      timeWindow === 'CUSTOM_RANGE'
                        ? 'border-indigo-200 bg-indigo-50'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'
                    }`}
                  >
                    <p className="text-sm font-semibold text-neutral-800">Custom Range</p>
                    <p className="mt-0.5 text-xs text-neutral-500">Specific start and end dates</p>
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

                {timeWindow === 'CUSTOM_RANGE' ? (
                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <Label className="text-xs font-semibold text-neutral-600">Start</Label>
                      <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="mt-2 h-10 w-full rounded-sm border border-gray-400 bg-white px-3 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-neutral-600">End</Label>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="mt-2 h-10 w-full rounded-sm border border-gray-400 bg-white px-3 text-sm"
                      />
                    </div>
                  </div>
                ) : null}

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
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <Card className="rounded-xl border border-neutral-200 shadow-sm">
              <CardHeader className="px-5 pb-3 pt-5">
                <CardTitle className="text-base">Actions</CardTitle>
                <p className="mt-1 text-xs text-neutral-500">Save the KPI definition to the server.</p>
              </CardHeader>
              <CardContent className="space-y-3 px-5 pb-5">
                <Button onClick={onSave} disabled={saving} className="w-full">
                  {saving
                    ? 'Saving...'
                    : editingKpiId > 0
                      ? 'Update KPI Definition'
                      : 'Save KPI Definition'}
                </Button>
                {saveError ? <p className="text-xs text-red-600">{saveError}</p> : null}
                {saveSuccess ? <p className="text-xs text-emerald-700">{saveSuccess}</p> : null}
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-neutral-200 shadow-sm">
              <CardHeader className="px-5 pb-3 pt-5">
                <CardTitle className="text-base">Sample Data Test</CardTitle>
                <p className="mt-1 text-xs text-neutral-500">Test the KPI with a specific salesperson/personnel code.</p>
              </CardHeader>
              <CardContent className="space-y-3 px-5 pb-5">
                <Input
                  label=""
                  variant="standard"
                  placeholder="e.g., SP001"
                  value={sampleCode}
                  onChange={(e) => setSampleCode(e.target.value)}
                />
                <div className="space-y-2">
                  <div className="h-10 rounded-md bg-neutral-200" />
                  <div className="h-10 rounded-md bg-neutral-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

