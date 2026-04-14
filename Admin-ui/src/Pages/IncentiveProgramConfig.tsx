import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { MdOutlineInfo } from 'react-icons/md'
import { FiChevronRight, FiCode, FiFilter, FiInfo, FiMenu, FiPlus, FiSearch, FiTrash2, FiUsers } from 'react-icons/fi'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { format, parse } from 'date-fns'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Button from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import DatePicker from '@/components/ui/date-picker'
import { Checkbox } from '@/components/ui/checkbox'
import { incentiveService } from '@/services/incentiveService'
import { showToast } from '@/components/ui/sonner'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { NOTIFICATION_CONSTANTS } from '@/utils/constant'
import type {
  ClawbackBasis,
  IKpi,
  IncentiveFrequency,
  ProgramDetailCategory,
  ProgramScheduleType,
} from '@/models/incentive'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  QueryBuilder,
  buildFieldsFromSelectedKpis,
  createEmptyGroup,
  queryFieldsFromTableSchemaResponse,
  queryGroupToSql,
  tableNameForKpi,
  toVarName,
  type QueryFieldConfig,
  type QueryGroupNode,
} from '@/components/query-builder'
import { IncentiveConfig } from '@/components/incentives/IncentiveConfig'
import { AddUserInline } from '@/components/incentives/AddUserDialog'
import { MultiSelectInline } from '@/components/incentives/MultiSelectInline'

type WeightageOption = { key: string; id: number | null; label: string }

type CascadeOption = { id: number; label: string }

function extractCascadeRows(responseBody: any, preferredKeys: string[]): any[] {
  if (!responseBody || typeof responseBody !== 'object') return []

  const cf = responseBody.cascadingFilters
  if (cf && typeof cf === 'object') {
    for (const k of preferredKeys) {
      const a = cf[k]
      if (Array.isArray(a) && a.length) return a
    }
  }

  for (const k of preferredKeys) {
    const a = responseBody[k]
    if (Array.isArray(a) && a.length) return a
  }

  if (cf && typeof cf === 'object') {
    for (const v of Object.values(cf)) {
      if (Array.isArray(v) && v.length && typeof (v as any)[0] === 'object') {
        return v as any[]
      }
    }
  }

  for (const v of Object.values(responseBody)) {
    if (Array.isArray(v) && v.length && typeof (v as any)[0] === 'object') {
      return v as any[]
    }
  }
  return []
}

function mapCascadeOptions(
  rows: any[],
  idFields: string[],
  labelFields: string[],
): CascadeOption[] {
  return rows
    .map((row) => {
      let id: number | null = null
      for (const f of idFields) {
        const v = row?.[f]
        if (v !== undefined && v !== null && v !== '') {
          const n = Number(v)
          if (Number.isFinite(n) && n > 0) {
            id = n
            break
          }
        }
      }
      if (id == null) return null
      let label = ''
      for (const f of labelFields) {
        const v = row?.[f]
        if (v != null && String(v).trim()) {
          label = String(v).trim()
          break
        }
      }
      if (!label) label = `Option ${id}`
      return { id, label }
    })
    .filter(Boolean) as CascadeOption[]
}

function extractFirstObjectArray(payload: any): any[] {
  if (!payload) return []

  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.responseBody)) return payload.responseBody

  const rb = payload?.responseBody
  if (Array.isArray(rb)) return rb

  const maybeObj = rb && typeof rb === 'object' ? rb : payload
  if (!maybeObj || typeof maybeObj !== 'object') return []

  for (const v of Object.values(maybeObj)) {
    if (Array.isArray(v) && v.length && typeof (v as any)[0] === 'object') {
      return v as any[]
    }
  }

  return []
}

function extractClubRows(payload: any): any[] {
  const body = payload?.responseBody ?? payload
  if (!body || typeof body !== 'object') return []
  for (const k of ['clubs', 'clubList', 'agentClubs', 'items']) {
    const a = (body as Record<string, unknown>)[k]
    if (Array.isArray(a) && a.length) return a as any[]
  }
  return extractFirstObjectArray(body)
}

function parseProgramClubIds(payload: any): number[] {
  const body = payload?.responseBody ?? payload
  const raw =
    body?.clubIds ??
    body?.selectedClubIds ??
    body?.clubs ??
    body?.items
  if (!Array.isArray(raw)) return []
  const ids: number[] = []
  for (const item of raw) {
    if (item == null) continue
    if (typeof item === 'number' || typeof item === 'string') {
      const n = Number(item)
      if (Number.isFinite(n) && n > 0) ids.push(n)
      continue
    }
    if (typeof item === 'object') {
      const obj = item as {
        clubId?: unknown
        id?: unknown
        isSelected?: unknown
        selected?: unknown
        isActive?: unknown
      }
      const isSelected =
        obj.isSelected === true ||
        obj.selected === true ||
        obj.isActive === true

      // If API returns an array of club objects with selection flags, respect them.
      if (isSelected) {
        const n = Number(obj.clubId ?? obj.id)
        if (Number.isFinite(n) && n > 0) ids.push(n)
      }
    }
  }
  return ids
}

function normalizeKpiLibraryFromResponse(payload: any): IKpi[] {
  const body = payload?.responseBody ?? payload
  const list =
    body?.programKpis ??
    body?.kpiLibrary ??
    body?.kpis ??
    body?.items ??
    (Array.isArray(body) ? body : []) ??
    []

  if (!Array.isArray(list)) return []

  return list
    .map((item: any): IKpi | null => {
      const rawId = item?.id ?? item?.kpiId ?? item?.kpiID ?? item?.KpiId
      const idNum = Number(rawId)
      const id = Number.isFinite(idNum) && idNum > 0 ? String(idNum) : (rawId != null ? String(rawId) : '')
      if (!id) return null

      const name = String(item?.name ?? item?.kpiName ?? item?.kpi_name ?? `KPI ${id}`)
      const description = String(
        item?.description ??
          item?.kpiDescription ??
          item?.kpi_description ??
          item?.kpiCode ??
          '',
      )

      const dataSources = Array.isArray(item?.dataSources)
        ? item.dataSources
        : Array.isArray(item?.dataSource)
          ? item.dataSource
          : []

      const groupBy = Array.isArray(item?.groupBy)
        ? item.groupBy
        : Array.isArray(item?.group_by)
          ? item.group_by
          : []

      const timeWindow = String(item?.timeWindow ?? item?.time_window ?? item?.timePeriod ?? 'PROGRAM_DURATION')

      return {
        id,
        name,
        description,
        dataSources,
        groupBy,
        timeWindow,
        createdAt: String(item?.createdAt ?? ''),
        createdBy: String(item?.createdBy ?? ''),
      }
    })
    .filter(Boolean) as IKpi[]
}

type KPIEntry = IKpi

interface SelectedKPI {
  kpiId: string
  weight: number
}

interface SlabState {
  id: string
  programName: string
  programDescription: string
  startDate: string
  endDate: string
  selectedKPIs: Array<SelectedKPI>
  criteriaTab: 'selected-kpi' | 'expression'
  /** JSON query tree for Selection Expression tab (slab-wide) */
  selectionQuery: QueryGroupNode
  selectionExpression: string
  /** Per–selected-KPI filter query (JSON) */
  kpiCriteriaQueries: Record<string, QueryGroupNode>
  incentiveExpression: string
}

// ─── Agent Filter Types ───────────────────────────────────────────────────────

interface AgentFilterState {
  channels: string[]
  subChannels: string[]
  branches: string[]
  designations: string[]
}

const OBJECT_COLORS: Record<string, string> = {
  Policy: 'bg-teal-100 text-teal-800',
  Training: 'bg-purple-100 text-purple-800',
  'Sales Activity': 'bg-amber-100 text-amber-800',
}

const TIME_WINDOW_LABELS: Record<string, string> = {
  PROGRAM_DURATION: 'Program Duration',
  CUSTOM_RANGE: 'Custom Range',
  ROLLING_WINDOW: 'Rolling Window',
}

// ─── Weightage Options ────────────────────────────────────────────────────────

const WEIGHTAGE_OPTIONS = ['Weightage A', 'Weightage B', 'Weightage C']

// ─── Past Cycle Program Options ───────────────────────────────────────────────

const PAST_CYCLE_PROGRAMS = ['Program 1', 'Program 2', 'Program 3']

const PROGRAM_DETAIL_TABS: ReadonlyArray<{ id: ProgramDetailCategory; label: string }> = [
  { id: 'standard', label: 'Standard Programs' },
  { id: 'fresher', label: 'Fresher Programs' },
  { id: 'multi_layered', label: 'Multi Layered Program' },
  { id: 'career_progression', label: 'Career Progression' },
  { id: 'commission', label: 'Commission' },
]

const FRESHER_MONTH_OPTIONS: ReadonlyArray<{ value: number; label: string }> = [
  { value: 1, label: 'M1' },
  { value: 2, label: 'M2' },
  { value: 3, label: 'M3' },
  { value: 4, label: 'M4' },
  { value: 5, label: 'M5' },
  { value: 6, label: 'M6' },
]

function mapIncentiveFrequencyForApi(freq: IncentiveFrequency): string {
  const m: Record<IncentiveFrequency, string> = {
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    half_yearly: 'Half Yearly',
  }
  return m[freq]
}

function clawbackPeriodForApi(basis: ClawbackBasis): string {
  return basis === 'itd' ? 'ITD' : basis === 'fytd' ? 'FYTD' : 'CYTD'
}

function toUiDate(value: unknown): string | null {
  if (value == null || value === '') return null
  const d = new Date(String(value))
  if (Number.isNaN(d.getTime())) return null
  return format(d, 'dd LLL yyyy')
}

function monthsBetweenInclusive(fromIso: unknown, toIso: unknown): number[] {
  const from = new Date(String(fromIso))
  const to = new Date(String(toIso))
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return []
  const start = new Date(from.getFullYear(), from.getMonth(), 1)
  const end = new Date(to.getFullYear(), to.getMonth(), 1)
  const out: number[] = []
  const cursor = new Date(start)
  // Cap at 24 months to avoid accidental infinite loops from bad input.
  for (let guard = 0; guard < 24; guard++) {
    out.push(cursor.getMonth() + 1)
    if (cursor.getFullYear() === end.getFullYear() && cursor.getMonth() === end.getMonth()) break
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return out
}

interface SlabSectionProps {
  slab: SlabState
  slabNumber: number
  canRemove: boolean
  onChange: (updates: Partial<SlabState>) => void
  onRemove: () => void
  kpiLibrary: KPIEntry[]
  kpiLibraryLoading: boolean
  onRefreshProgramKpis: () => void | Promise<void>
  programId: number | null
  programmeId: number | undefined
}

const SlabSection = ({
  slab,
  slabNumber,
  canRemove,
  onChange,
  onRemove,
  kpiLibrary,
  kpiLibraryLoading,
  onRefreshProgramKpis,
  programId,
  programmeId,
}: SlabSectionProps) => {
  const expressionRef = useRef<HTMLTextAreaElement>(null)
  const prevCriteriaTab = useRef(slab.criteriaTab)
  /** Dedupe GetTableSchema fetches per KPI when `tableName` matches last successful attempt. */
  const tableSchemaFetchedRef = useRef<Record<string, string>>({})
  const [kpiSchemaFields, setKpiSchemaFields] = useState<Record<string, QueryFieldConfig[]>>({})
  const [kpiSchemaLoading, setKpiSchemaLoading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const switchedToKpi =
      slab.criteriaTab === 'selected-kpi' &&
      prevCriteriaTab.current !== 'selected-kpi' &&
      programId != null
    prevCriteriaTab.current = slab.criteriaTab
    if (switchedToKpi) void onRefreshProgramKpis()
  }, [slab.criteriaTab, programId, onRefreshProgramKpis])

  const isKPISelected = (id: string) => slab.selectedKPIs.some((s) => s.kpiId === id)

  const toggleKPI = (id: string) => {
    if (slab.selectedKPIs.some((s) => s.kpiId === id)) {
      const { [id]: _removed, ...restQueries } = slab.kpiCriteriaQueries
      delete tableSchemaFetchedRef.current[id]
      setKpiSchemaFields((prev) => {
        const n = { ...prev }
        delete n[id]
        return n
      })
      setKpiSchemaLoading((prev) => {
        const n = { ...prev }
        delete n[id]
        return n
      })
      onChange({
        selectedKPIs: slab.selectedKPIs.filter((s) => s.kpiId !== id),
        kpiCriteriaQueries: restQueries,
      })
      return
    }

    onChange({
      selectedKPIs: [...slab.selectedKPIs, { kpiId: id, weight: 1 }],
      kpiCriteriaQueries: {
        ...slab.kpiCriteriaQueries,
        [id]: createEmptyGroup([]),
      },
    })
  }

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      for (const sel of slab.selectedKPIs) {
        const kpi = kpiLibrary.find((k) => k.id === sel.kpiId)
        if (!kpi) continue
        const tableName = tableNameForKpi(kpi)
        if (tableSchemaFetchedRef.current[sel.kpiId] === tableName) continue

        setKpiSchemaLoading((p) => ({ ...p, [sel.kpiId]: true }))
        try {
          const res = await incentiveService.getTableSchema(tableName)
          if (cancelled) return
          const fields = queryFieldsFromTableSchemaResponse(res)
          tableSchemaFetchedRef.current[sel.kpiId] = tableName
          setKpiSchemaFields((p) => ({ ...p, [sel.kpiId]: fields }))
        } catch (e) {
          if (cancelled) return
          tableSchemaFetchedRef.current[sel.kpiId] = tableName
          setKpiSchemaFields((p) => ({ ...p, [sel.kpiId]: [] }))
          showToast(
            NOTIFICATION_CONSTANTS.ERROR,
            e instanceof Error ? e.message : `Could not load columns for ${tableName}`,
          )
        } finally {
          if (!cancelled) {
            setKpiSchemaLoading((p) => ({ ...p, [sel.kpiId]: false }))
          }
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [slab.selectedKPIs, kpiLibrary])

  useEffect(() => {
    let next = slab.kpiCriteriaQueries
    let changed = false
    for (const sel of slab.selectedKPIs) {
      if (next[sel.kpiId]) continue
      changed = true
      next = {
        ...next,
        [sel.kpiId]: createEmptyGroup([]),
      }
    }
    if (changed) onChange({ kpiCriteriaQueries: next })
  }, [slab.selectedKPIs, slab.kpiCriteriaQueries, onChange])

  /** When schema arrives, seed an empty slab query with one rule if needed. */
  useEffect(() => {
    let next = slab.kpiCriteriaQueries
    let changed = false
    for (const sel of slab.selectedKPIs) {
      const fields = kpiSchemaFields[sel.kpiId]
      if (!fields?.length) continue
      const q = next[sel.kpiId]
      if (q && q.children.length === 0) {
        changed = true
        next = { ...next, [sel.kpiId]: createEmptyGroup(fields) }
      }
    }
    if (changed) onChange({ kpiCriteriaQueries: next })
  }, [kpiSchemaFields, slab.selectedKPIs, slab.kpiCriteriaQueries, onChange])

  const incentivePlaceholder = useMemo(() => {
    if (slab.selectedKPIs.length === 0) return 'e.g., total_premium_by_sales_personnel * 0.05'
    const firstName = kpiLibrary.find((k) => k.id === slab.selectedKPIs[0].kpiId)?.name ?? ''
    return `e.g., ${toVarName(firstName)} * 0.05`
  }, [slab.selectedKPIs, kpiLibrary])

  const kpiFields = useMemo(
    () =>
      kpiLibrary.map((kpi) => ({
        name: toVarName(kpi.name),
        label: kpi.name,
        description: kpi.description,
      })),
    [kpiLibrary],
  )

  const selectionExpressionFields = useMemo(
    () =>
      buildFieldsFromSelectedKpis(
        slab.selectedKPIs.map((s) => s.kpiId),
        kpiLibrary,
      ),
    [slab.selectedKPIs, kpiLibrary],
  )

  const updateSelectedKPI = (id: string, updates: Partial<Omit<SelectedKPI, 'kpiId'>>) => {
    onChange({
      selectedKPIs: slab.selectedKPIs.map((s) => (s.kpiId === id ? { ...s, ...updates } : s)),
    })
  }

  const insertVariable = (varName: string) => {
    const textarea = expressionRef.current
    if (!textarea) {
      onChange({ incentiveExpression: slab.incentiveExpression + varName })
      return
    }
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newValue =
      slab.incentiveExpression.slice(0, start) + varName + slab.incentiveExpression.slice(end)
    onChange({ incentiveExpression: newValue })
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + varName.length
      textarea.focus()
    }, 0)
  }

  return (
    <div className="h-full bg-white">
      {/* Slab Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-3">
        <h2 className="text-base font-semibold text-neutral-800">Slab {slabNumber} Configuration</h2>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-red-500 transition hover:bg-red-50"
          >
            <FiTrash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        )}
      </div>

      <div className="space-y-4 p-4">
        <Card className="rounded-md border border-neutral-200">
          <div className="grid grid-cols-1 border-neutral-200 md:grid-cols-[minmax(12rem,20rem)_minmax(0,1fr)] md:divide-x">
            <CardHeader className="min-w-0 border-b border-neutral-200 px-4 py-3 md:border-b-0">
              <CardTitle className="text-base font-semibold">Weightage</CardTitle>
              <p className="mt-1 text-xs text-neutral-500">
                Select the applicable weightage options for this incentive program.
              </p>
              <p className="mt-1 text-xs text-neutral-600">
                Program id for save:{' '}
                <span className="font-medium text-neutral-800">
                  {programId != null ? programId : '— save Program Details first'}
                </span>
              </p>
            </CardHeader>
            <CardContent className="min-w-0 overflow-x-auto px-4 py-4">
              <AddUserInline
                programId={programmeId ?? 0}
                onSuccess={(users) => {
                  console.log('Saved users:', users)
                }}
              />
            </CardContent>
          </div>
        </Card>

        {/* ── 3. Filter Criteria — tabbed: Selected KPI | Selection Expression ── */}
        <Card className="rounded-lg border border-neutral-200">
          <CardHeader className="px-4 pb-2 pt-4">
            <CardTitle className="text-base">Filter Criteria</CardTitle>
            <p className="mt-0.5 text-xs text-neutral-500">
              KPIs for this slab come from{' '}
              <strong className="text-neutral-700">GetSelectedProgramKpis</strong> using your saved program id.
              Use <strong>Selected KPI</strong> for simple comparisons (AND/OR, &gt;, &lt;, between). Use{' '}
              <strong>Selection Expression</strong> for richer SQL against the database.
            </p>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <Tabs
              value={slab.criteriaTab}
              onValueChange={(v) =>
                onChange({ criteriaTab: v as SlabState['criteriaTab'] })
              }
            >
              <TabsList className="mb-4">
                <TabsTrigger value="selected-kpi" className="gap-1.5">
                  <FiInfo className="h-3.5 w-3.5" />
                  Selected KPI
                </TabsTrigger>
                <TabsTrigger value="expression" className="gap-1.5">
                  <FiFilter className="h-3.5 w-3.5" />
                  Selection Expression
                </TabsTrigger>
              </TabsList>

              {/* Tab: Selected KPI — POST GetSelectedProgramKpis/{programId}, simple rule builder */}
              <TabsContent value="selected-kpi">
                {programId == null ? (
                  <div className="rounded-lg border border-dashed border-amber-200 bg-amber-50/50 p-4 text-center">
                    <p className="text-xs text-amber-900">
                      Save <strong>Program Details</strong> first so a program id exists. Then KPIs from the
                      program mapping will load here.
                    </p>
                  </div>
                ) : kpiLibraryLoading ? (
                  <div className="rounded-lg border border-neutral-200 p-6 text-center">
                    <p className="text-xs text-neutral-500">Loading program KPIs…</p>
                  </div>
                ) : kpiLibrary.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-center">
                    <FiInfo className="mx-auto mb-2 h-5 w-5 text-neutral-400" />
                    <p className="text-xs text-neutral-500">
                      No KPIs returned for this program. Map KPIs to the program in your admin flow, then use
                      Refresh or revisit this tab.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => void onRefreshProgramKpis()}
                    >
                      Refresh KPIs
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-neutral-500">
                        Program id <span className="font-mono text-neutral-700">{programId}</span> — select KPIs
                        for this slab.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void onRefreshProgramKpis()}
                        disabled={kpiLibraryLoading}
                      >
                        Refresh KPIs
                      </Button>
                    </div>

                    <div className="max-h-48 overflow-auto rounded-md border border-neutral-200">
                      {kpiLibrary.map((kpi) => (
                        <label
                          key={kpi.id}
                          className="flex cursor-pointer items-start gap-2 border-b border-neutral-100 p-3 last:border-b-0 hover:bg-neutral-50"
                        >
                          <Checkbox
                            className="mt-0.5"
                            checked={isKPISelected(kpi.id)}
                            onCheckedChange={() => toggleKPI(kpi.id)}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-neutral-800">{kpi.name}</p>
                            <p className="mt-0.5 line-clamp-2 text-xs text-neutral-500">{kpi.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>

                    {slab.selectedKPIs.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-center">
                        <FiInfo className="mx-auto mb-2 h-5 w-5 text-neutral-400" />
                        <p className="text-xs text-neutral-400">
                          Select at least one KPI above to set weights and simple filters.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {slab.selectedKPIs.map((sel, idx) => {
                          const kpi = kpiLibrary.find((k) => k.id === sel.kpiId)
                          if (!kpi) return null
                          const tableForSchema = tableNameForKpi(kpi)
                          const fields = kpiSchemaFields[sel.kpiId] ?? []
                          const schemaLoading = !!kpiSchemaLoading[sel.kpiId]
                          const query =
                            slab.kpiCriteriaQueries[sel.kpiId] ?? createEmptyGroup(fields)
                          return (
                            <div key={sel.kpiId} className="space-y-2">
                              {idx > 0 && <Separator />}
                              <div>
                                <p className="text-sm font-semibold text-neutral-800">{kpi.name}</p>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {kpi.dataSources.map((ds, i) => (
                                    <Badge
                                      key={i}
                                      className={`text-xs ${OBJECT_COLORS[ds.object] ?? ''}`}
                                    >
                                      {ds.object}
                                    </Badge>
                                  ))}
                                </div>
                                <p className="mt-1 text-[10px] text-neutral-400">
                                  Filter columns from{' '}
                                  <span className="font-mono text-neutral-600">{tableForSchema}</span>
                                  {schemaLoading ? ' — loading schema…' : null}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Label className="whitespace-nowrap text-xs font-semibold text-neutral-600">
                                  Weight
                                </Label>
                                <Input
                                  label=""
                                  variant="outlined"
                                  type="number"
                                  className="w-20 text-sm"
                                  min={0}
                                  max={100}
                                  step={0.1}
                                  value={sel.weight}
                                  onChange={(e) =>
                                    updateSelectedKPI(sel.kpiId, {
                                      weight: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                />
                                <span className="text-xs text-neutral-500">
                                  (relative weight in incentive formula)
                                </span>
                              </div>

                              <div className="pt-1">
                                <QueryBuilder
                                  variant="simple"
                                  fields={fields}
                                  value={query}
                                  onChange={(next) =>
                                    onChange({
                                      kpiCriteriaQueries: { ...slab.kpiCriteriaQueries, [sel.kpiId]: next },
                                    })
                                  }
                                  title="Simple filter"
                                  description="Columns from GetTableSchema for this KPI’s primary object. Combine rules with AND/OR."
                                  className="mt-2"
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Tab: Selection Expression — full query builder + SQL */}
              <TabsContent value="expression">
                <QueryBuilder
                  fields={selectionExpressionFields}
                  value={slab.selectionQuery}
                  onChange={(next) =>
                    onChange({
                      selectionQuery: next,
                      selectionExpression: queryGroupToSql(next, selectionExpressionFields),
                    })
                  }
                  title="Selection Expression"
                  description="Full builder with nested groups and SQL preview. Use when you need complex criteria against the database."
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* ── 4. Incentive Calculation Expression ── */}
        <Card className="rounded-lg border border-neutral-200">
          <CardHeader className="px-4 pb-2 pt-4">
            <div className="flex items-center gap-2">
              <FiCode className="h-4 w-4 text-green-500" />
              <CardTitle className="text-base">Incentive Calculation</CardTitle>
            </div>
            <p className="mt-0.5 text-xs text-neutral-500">
              Write a formula using KPI variables to calculate the incentive payout for
              qualifying sales personnel. Click a variable chip to insert it at the cursor
              position.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            {/* Available variables */}
            <div>
              <Label className="mb-2 block text-xs font-semibold text-neutral-600">
                Available Variables
              </Label>
              {slab.selectedKPIs.length === 0 ? (
                <p className="text-xs text-neutral-400">
                  Select KPIs for this slab to make variables available here.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slab.selectedKPIs.map((sel) => {
                    const kpi = kpiLibrary.find((k) => k.id === sel.kpiId)
                    if (!kpi) return null
                    const varName = toVarName(kpi.name)
                    return (
                      <button
                        key={sel.kpiId}
                        type="button"
                        title={kpi.description}
                        onClick={() => insertVariable(varName)}
                        className="rounded border border-green-200 bg-green-50 px-2 py-1 font-mono text-xs text-green-800 transition hover:bg-green-100"
                      >
                        {varName}
                      </button>
                    )
                  })}
                </div>
              )}
              {slab.selectedKPIs.length > 0 && (
                <p className="mt-1.5 text-xs text-neutral-400">
                  Tip: Use standard arithmetic operators +&nbsp;−&nbsp;*&nbsp;/ and numeric
                  constants. Example:{' '}
                  <span className="font-mono">{incentivePlaceholder.replace('e.g., ', '')}</span>
                </p>
              )}
            </div>

            <Separator />

            {/* Expression textarea */}
            <div>
              <Label className="mb-1 block text-xs font-semibold text-neutral-600">
                Expression *
              </Label>
              <textarea
                ref={expressionRef}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 font-mono text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                rows={4}
                placeholder={incentivePlaceholder}
                value={slab.incentiveExpression}
                onChange={(e) => onChange({ incentiveExpression: e.target.value })}
              />
            </div>

            {/* Expression preview */}
            {slab.incentiveExpression.trim() && (
              <div className="rounded-lg border border-green-100 bg-green-50 p-3">
                <p className="mb-1 text-xs font-semibold text-green-700">Expression Preview:</p>
                <p className="font-mono text-sm text-green-800">{slab.incentiveExpression}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const createSlab = (): SlabState => ({
  id: crypto.randomUUID(),
  programName: '',
  programDescription: '',
  startDate: '',
  endDate: '',
  selectedKPIs: [],
  criteriaTab: 'selected-kpi',
  selectionQuery: createEmptyGroup([]),
  selectionExpression: '',
  kpiCriteriaQueries: {},
  incentiveExpression: '',
})


// ─── Shared KPI Library (loaded from API) ────────────────────────────────────

const KPI_LIBRARY_PLACEHOLDER: KPIEntry[] = []

export default function IncentiveProgramConfig() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { programId?: string | number }
  const editingProgramIdFromUrl = useMemo(() => {
    const raw = search?.programId
    if (raw === undefined || raw === null || raw === '') return null
    const n = typeof raw === 'string' ? parseInt(raw, 10) : Number(raw)
    return Number.isFinite(n) && n > 0 ? n : null
  }, [search?.programId])
  // const [programId, setProgramId] = useState<number | null>(null)
  const [cronValue, setCronValue] = useState("")
  const [programmeId, setProgrammeId] = useState()
  const [open, setOpen] = useState(true)
  const [programName, setProgramName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [programId, setProgramId] = useState<number | null>(null)
  const [isSavingWeightages, setIsSavingWeightages] = useState(false)
  const [loadingProgram, setLoadingProgram] = useState(false)

  useEffect(() => {
    if (editingProgramIdFromUrl != null) setProgramId(editingProgramIdFromUrl)
  }, [editingProgramIdFromUrl])

  const isEditMode = editingProgramIdFromUrl != null
  const [isSavingFilters, setIsSavingFilters] = useState(false)
  const [cappingAmount, setCappingAmount] = useState<string>('')
  const [executionFrequency, setExecutionFrequency] = useState<string>('MONTHLY')
  const [selectionExpression, setSelectionExpression] = useState<string>('')

  const [programDetailTab, setProgramDetailTab] = useState<ProgramDetailCategory>('standard')
  const [programType, setProgramType] = useState<ProgramScheduleType>('one_time')
  const [incentiveFrequency, setIncentiveFrequency] = useState<IncentiveFrequency>('monthly')
  const [conversionPeriodDays, setConversionPeriodDays] = useState<string>('')
  const [cancellationPeriodDays, setCancellationPeriodDays] = useState<string>('')
  const [clawbackConsidered, setClawbackConsidered] = useState(false)
  const [clawbackBasis, setClawbackBasis] = useState<ClawbackBasis>('cytd')

  type FresherTargetInput = { logins: string; conversions: string; amount: string }
  const [fresherTargetsInput, setFresherTargetsInput] = useState<FresherTargetInput[]>(() =>
    Array.from({ length: 6 }, () => ({ logins: '', conversions: '', amount: '' })),
  )
  const [fresherSelectedMonths, setFresherSelectedMonths] = useState<boolean[]>(() =>
    Array.from({ length: 6 }, () => true),
  )
  const [fresherCatchUpPrevious, setFresherCatchUpPrevious] = useState(false)
  const [fresherEarlyBonus, setFresherEarlyBonus] = useState(false)

  const programCategoryForApi = (tab: ProgramDetailCategory) => {
    // Backend appears to key off exact category labels (see UpsertProgram sample).
    if (tab === 'fresher') return 'Fresher Program'
    return PROGRAM_DETAIL_TABS.find((t) => t.id === tab)?.label ?? tab
  }

  const toNonNegativeNumber = (raw: any) => {
    const n = typeof raw === 'number' ? raw : parseFloat(String(raw ?? '').trim())
    if (!Number.isFinite(n)) return 0
    return n < 0 ? 0 : n
  }

  const toNonNegativeInt = (raw: any) => {
    const n = typeof raw === 'number' ? raw : parseInt(String(raw ?? '').trim(), 10)
    if (!Number.isFinite(n)) return 0
    return n < 0 ? 0 : n
  }

  const parseFresherTargetDescription = useCallback((raw: any): FresherTargetInput => {
    const s = String(raw ?? '').trim()
    if (!s) return { logins: '', conversions: '', amount: '' }

    const nums = s.match(/-?\d+(?:\.\d+)?/g) ?? []
    return {
      logins: nums[0] ?? '',
      conversions: nums[1] ?? '',
      amount: nums[2] ?? '',
    }
  }, [])

  // Load program header for edit mode (programId from list → config).
  useEffect(() => {
    let cancelled = false
    if (!isEditMode || !programId) return

    ;(async () => {
      setLoadingProgram(true)
      try {
        const res: any = await incentiveService.getProgramById(String(programId))
        const incentiveProgram = res?.responseBody?.incentiveProgram ?? res?.incentiveProgram ?? res
        if (!incentiveProgram || cancelled) return

        // Lock program name for edits.
        setProgramName(String(incentiveProgram.programName ?? incentiveProgram.name ?? '').trim())
        setDescription(String(incentiveProgram.description ?? '').trim())

        const uiFrom = toUiDate(incentiveProgram.effectiveFrom ?? incentiveProgram.startDate)
        const uiTo = toUiDate(incentiveProgram.effectiveTo ?? incentiveProgram.endDate)
        if (uiFrom) setStartDate(uiFrom)
        if (uiTo) setEndDate(uiTo)

        const category = String(incentiveProgram.programCategory ?? '').trim()
        const tab =
          PROGRAM_DETAIL_TABS.find((t) => t.label.toLowerCase() === category.toLowerCase())?.id ??
          (category.toLowerCase().includes('fresher') ? 'fresher' : programDetailTab)
        setProgramDetailTab(tab as ProgramDetailCategory)

        const pt = String(incentiveProgram.programType ?? '').toLowerCase()
        setProgramType(pt.includes('perpetual') ? 'perpetual' : 'one_time')

        setCronValue(String(incentiveProgram.executionFrequency ?? cronValue ?? executionFrequency ?? '').toUpperCase())
        setCappingAmount(String(incentiveProgram.cappingAmount ?? ''))
        setConversionPeriodDays(String(incentiveProgram.conversionPeriod ?? incentiveProgram.conversionPeriodDays ?? ''))
        setCancellationPeriodDays(String(incentiveProgram.cancellationPeriod ?? incentiveProgram.cancellationPeriodDays ?? ''))

        const consider = Boolean(incentiveProgram.considerClawback ?? incentiveProgram.clawbackRecoveries)
        setClawbackConsidered(consider)

        // KPI ids from mapping list.
        const kpis = Array.isArray(incentiveProgram.kpis) ? incentiveProgram.kpis : []
        const ids = kpis
          .map((k: any) => Number(k?.kpiId))
          .filter((n: number) => Number.isFinite(n) && n > 0)
        if (ids.length) setSelectedKpiIds(ids)

        // Fresher targets (M1–M6) → 3 numeric fields (logins, conversions, amount)
        const targets = Array.isArray(incentiveProgram.fresherTargets) ? incentiveProgram.fresherTargets : []
        if (targets.length) {
          setFresherTargetsInput((prev) => {
            const next = prev.slice(0, 6)
            while (next.length < 6) next.push({ logins: '', conversions: '', amount: '' })
            for (let i = 0; i < Math.min(6, targets.length); i++) {
              const t = targets[i]
              // Prefer explicit numeric fields if API sends them; fallback to legacy `targetDescription`.
              const hasNumericFields =
                t != null &&
                (t.logins != null || t.conversions != null || t.amount != null)
              next[i] = hasNumericFields
                ? {
                    logins: String(t?.logins ?? ''),
                    conversions: String(t?.conversions ?? ''),
                    amount: String(t?.amount ?? ''),
                  }
                : parseFresherTargetDescription(t?.targetDescription)
            }
            return next
          })
          setFresherSelectedMonths(() => {
            // Select only months that exist in API data; if API has 6, all selected.
            const count = Math.min(6, targets.length)
            return Array.from({ length: 6 }, (_, i) => i < count)
          })
        }

        setFresherCatchUpPrevious(Boolean(incentiveProgram.catchUpPreviousQualification))
        setFresherEarlyBonus(Boolean(incentiveProgram.earlyBonus))
      } catch (e) {
        if (!cancelled) {
          showToast(NOTIFICATION_CONSTANTS.ERROR, 'Failed to load program for edit')
        }
      } finally {
        if (!cancelled) setLoadingProgram(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isEditMode, programId])

  const [weightageOptions, setWeightageOptions] = useState<WeightageOption[]>(
    [],
  )
  const [weightage, setWeightage] = useState<Record<string, boolean>>({})
  const [weightagesLoading, setWeightagesLoading] = useState(true)

  const [channelOptions, setChannelOptions] = useState<CascadeOption[]>([])
  const [selectedChannelIds, setSelectedChannelIds] = useState<number[]>([])
  const [channelsLoading, setChannelsLoading] = useState(false)

  const [subChannelOptions, setSubChannelOptions] = useState<CascadeOption[]>([])
  const [branchOptions, setBranchOptions] = useState<CascadeOption[]>([])
  const [designationOptions, setDesignationOptions] = useState<CascadeOption[]>(
    [],
  )
  const [selectedSubChannelIds, setSelectedSubChannelIds] = useState<number[]>(
    [],
  )
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([])
  const [selectedDesignationIds, setSelectedDesignationIds] = useState<number[]>(
    [],
  )
  const [subChannelsLoading, setSubChannelsLoading] = useState(false)
  const [branchesLoading, setBranchesLoading] = useState(false)

  const anyChannelSelected = useMemo(
    () => selectedChannelIds.length > 0,
    [selectedChannelIds],
  )

  const [slabs, setSlabs] = useState<Array<SlabState>>(() => [createSlab()])
  const [activeSlabId, setActiveSlabId] = useState<string>(() => slabs[0]?.id ?? '')
  const dragSlabIdRef = useRef<string | null>(null)
  const [dragOverSlabId, setDragOverSlabId] = useState<string | null>(null)
  const [agentFilter, setAgentFilter] = useState<AgentFilterState>({
    channels: [],
    subChannels: [],
    branches: [],
    designations: [],
  })

  // ─── API state ───────────────────────────────────────────────────────────────
  const [kpiLibrary, setKpiLibrary] = useState<KPIEntry[]>(KPI_LIBRARY_PLACEHOLDER)
  const [kpiLibraryLoading, setKpiLibraryLoading] = useState(false)
  const [kpisListOptions, setKpisListOptions] = useState<Array<{ id: number; label: string }>>([])
  const [kpisListLoading, setKpisListLoading] = useState(false)
  const [selectedKpiIds, setSelectedKpiIds] = useState<number[]>([])
  const [apiDesignations, setApiDesignations] = useState<Record<string, string[]>>({})
  const [designationsLoading, setDesignationsLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [selectedWeightages, setSelectedWeightages] = useState<string[]>([])

  const [clubOptions, setClubOptions] = useState<CascadeOption[]>([])
  const [selectedClubIds, setSelectedClubIds] = useState<number[]>([])
  const [clubsLoading, setClubsLoading] = useState(false)
  const [isSavingClubs, setIsSavingClubs] = useState(false)

  /** Convenience single values for downstream selects (UI is single-select there). */
  const primaryCascadeChannelId = useMemo(
    () => (selectedChannelIds.length ? selectedChannelIds[0] : null),
    [selectedChannelIds],
  )

  useEffect(() => {
    let cancelled = false

    const extractWeightageList = (payload: any): any[] => {
      const tryArrays = [
        payload?.responseBody?.weightages,
        payload?.responseBody?.weightage,
        payload?.responseBody?.weightageList,
        payload?.responseBody?.list,
        payload?.responseBody?.items,
        payload?.responseBody?.data,
        Array.isArray(payload?.responseBody) ? payload.responseBody : null,
        payload?.weightages,
        payload?.data,
        Array.isArray(payload) ? payload : null,
      ]

      for (const candidate of tryArrays) {
        if (Array.isArray(candidate) && candidate.length) return candidate
      }

      const rb = payload?.responseBody
      if (rb && typeof rb === 'object' && !Array.isArray(rb)) {
        for (const v of Object.values(rb)) {
          if (Array.isArray(v) && v.length && typeof v[0] === 'object') {
            return v
          }
        }
      }

      return []
    }

    const normalizeWeightages = (payload: any): WeightageOption[] => {
      const list = extractWeightageList(payload)

      return list
        .map((w, idx) => {
          const rawId =
            w?.weightageId ??
            w?.weightageID ??
            w?.WeightageId ??
            w?.id ??
            w?.ID
          const numericId =
            rawId === undefined || rawId === null || rawId === ''
              ? NaN
              : Number(rawId)

          const code =
            w?.code ?? w?.weightageCode ?? w?.weightage_code

          const labelRaw =
            w?.name ??
            w?.weightageName ??
            w?.label ??
            w?.description ??
            w?.title ??
            (code != null && String(code).trim() ? String(code) : null)

          const label =
            (labelRaw != null && String(labelRaw).trim()
              ? String(labelRaw).trim()
              : null) ??
            (Number.isFinite(numericId) ? `Weightage ${numericId}` : null) ??
            `Weightage ${idx + 1}`

          const key = Number.isFinite(numericId)
            ? String(numericId)
            : code != null && String(code).trim()
              ? String(code).trim()
              : `w-${idx}`

          return {
            key,
            id: Number.isFinite(numericId) ? numericId : null,
            label,
          }
        })
        .filter(Boolean) as WeightageOption[]
    }

    return () => {
      cancelled = true
    }
  }, [])

  // Fetch KPIs list from GetKpisList API on mount
  useEffect(() => {
    let cancelled = false

    const fetchKpis = async () => {
      try {
        setKpisListLoading(true)

        const res = await incentiveService.getKpisList()

        if (cancelled) return

        const body = (res as any)?.responseBody
        console.log("API BODY:", body)

        const rawList =
          body?.kpiLibrary ??   // ✅ THIS IS YOUR ACTUAL DATA
          body?.kpis ??
          body?.kpiList ??
          body?.items ??
          body?.weightages ??
          (Array.isArray(body) ? body : []) ??
          []

        console.log("RAW LIST:", rawList)

        const mapped = rawList.map((item: any) => ({
          id: item.kpiId ?? item.weightageId,
          label: item.kpiName ?? item.weightageName,
        }))

        setKpisListOptions(mapped)
      } catch (err) {
        if (cancelled) return
        console.error("Failed to load KPIs list:", err)
      } finally {
        if (!cancelled) setKpisListLoading(false)
      }
    }

    fetchKpis()

    return () => {
      cancelled = true
    }
  }, [])

  // Fetch KPI library for this program (POST GetSelectedProgramKpis/{programId})
  useEffect(() => {
    let cancelled = false

    const fetchLibrary = async () => {
      if (!programId) {
        setKpiLibrary([])
        return
      }

      try {
        setKpiLibraryLoading(true)
        const res = await incentiveService.getSelectedProgramKpis(programId)
        if (cancelled) return
        setKpiLibrary(normalizeKpiLibraryFromResponse(res))
      } catch (err: any) {
        if (cancelled) return
        setKpiLibrary([])
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.errorMessage ||
          err?.message ||
          'Failed to load KPIs for this program'
        showToast(NOTIFICATION_CONSTANTS.ERROR, message)
      } finally {
        if (!cancelled) setKpiLibraryLoading(false)
      }
    }

    fetchLibrary()

    return () => {
      cancelled = true
    }
  }, [programId])

  const refreshProgramKpis = useCallback(async () => {
    if (!programId) {
      setKpiLibrary([])
      return
    }
    try {
      setKpiLibraryLoading(true)
      const res = await incentiveService.getSelectedProgramKpis(programId)
      setKpiLibrary(normalizeKpiLibraryFromResponse(res))
    } catch (err: any) {
      setKpiLibrary([])
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errorMessage ||
        err?.message ||
        'Failed to load KPIs for this program'
      showToast(NOTIFICATION_CONSTANTS.ERROR, message)
    } finally {
      setKpiLibraryLoading(false)
    }
  }, [programId])

  // Fetch channels from cascade API on mount (no payload)
  useEffect(() => {
    let cancelled = false
    setChannelsLoading(true)
      ;(async () => {
        try {
          const res: any = await incentiveService.getFiltersCascade({})
          const rows = extractCascadeRows(res?.responseBody, [
            'channels',
            'channelList',
            'channel',
          ])
          const opts = mapCascadeOptions(rows, ['id', 'channelId'], [
            'name',
            'channelName',
            'label',
            'channelCode',
            'code',
          ])
          if (!cancelled) setChannelOptions(opts)
        } catch (err: any) {
          if (!cancelled) {
            setChannelOptions([])
            const message =
              err?.response?.data?.message ||
              err?.response?.data?.errorMessage ||
              err?.message ||
              'Failed to load channels'
            showToast(NOTIFICATION_CONSTANTS.ERROR, message)
          }
        } finally {
          if (!cancelled) setChannelsLoading(false)
        }
      })()
    return () => {
      cancelled = true
    }
  }, [])

  // Agent clubs for eligibility multi-select
  useEffect(() => {
    let cancelled = false
    setClubsLoading(true)
      ;(async () => {
        try {
          // As requested: load the *club list* from GetProgramClubs (POST with empty body)
          const res: any = await incentiveService.getProgramClubs({})
          if (cancelled) return
          const rows = extractClubRows(res?.responseBody ?? res)
          const opts = mapCascadeOptions(rows, ['clubId', 'id'], [
            'clubName',
            'name',
            'label',
            'title',
          ])
          if (!cancelled) setClubOptions(opts)
        } catch {
          if (!cancelled) setClubOptions([])
        } finally {
          if (!cancelled) setClubsLoading(false)
        }
      })()
    return () => {
      cancelled = true
    }
  }, [])

  // Load saved club selection when programId is available
  useEffect(() => {
    let cancelled = false
    if (!programId) {
      setSelectedClubIds([])
      return
    }
      ;(async () => {
        try {
          const res = await incentiveService.getProgramClubs({ programId })
          if (!cancelled) setSelectedClubIds(parseProgramClubIds(res))
        } catch {
          if (!cancelled) setSelectedClubIds([])
        }
      })()
    return () => {
      cancelled = true
    }
  }, [programId])

  useEffect(() => {
    setSelectedSubChannelIds([])
    setSelectedBranchIds([])
    setSelectedDesignationIds([])
  }, [selectedChannelIds])

  useEffect(() => {
    setSelectedBranchIds([])
    setSelectedDesignationIds([])
  }, [selectedSubChannelIds])

  useEffect(() => {
    setSelectedDesignationIds([])
  }, [selectedBranchIds])

  useEffect(() => {
    let cancelled = false
    if (!selectedChannelIds.length) {
      setSubChannelOptions([])
      setSubChannelsLoading(false)
      return
    }
    setSubChannelsLoading(true)
      ; (async () => {
        try {
          const res: any = await incentiveService.getFiltersCascade({
            channelIds: selectedChannelIds,
          })
          const rows = extractCascadeRows(res?.responseBody, [
            'subChannels',
            'subChannelList',
            'subChannel',
            'subChannelsList',
          ])
          const opts = mapCascadeOptions(rows, ['id', 'subChannelId'], [
            'name',
            'subChannelName',
            'label',
            'subChannelCode',
            'code',
          ])
          if (!cancelled) setSubChannelOptions(opts)
        } catch (err: any) {
          if (!cancelled) {
            setSubChannelOptions([])
            const message =
              err?.response?.data?.message ||
              err?.response?.data?.errorMessage ||
              err?.message ||
              'Failed to load sub-channels'
            showToast(NOTIFICATION_CONSTANTS.ERROR, message)
          }
        } finally {
          if (!cancelled) setSubChannelsLoading(false)
        }
      })()
    return () => {
      cancelled = true
    }
  }, [selectedChannelIds])

  useEffect(() => {
    let cancelled = false
    if (
      !selectedChannelIds.length ||
      !selectedSubChannelIds.length
    ) {
      setBranchOptions([])
      setBranchesLoading(false)
      return
    }
    setBranchesLoading(true)
      ; (async () => {
        try {
          const res: any = await incentiveService.getFiltersCascade({
            channelIds: selectedChannelIds,
            subChannelIds: selectedSubChannelIds,
          })
          const rows = extractCascadeRows(res?.responseBody, [
            'branches',
            'branchList',
            'branch',
            'locations',
            'locationList',
          ])
          const opts = mapCascadeOptions(rows, ['id', 'branchId', 'locationId'], [
            'name',
            'branchName',
            'locationName',
            'label',
            'code',
          ])
          if (!cancelled) setBranchOptions(opts)
        } catch (err: any) {
          if (!cancelled) {
            setBranchOptions([])
            const message =
              err?.response?.data?.message ||
              err?.response?.data?.errorMessage ||
              err?.message ||
              'Failed to load branches'
            showToast(NOTIFICATION_CONSTANTS.ERROR, message)
          }
        } finally {
          if (!cancelled) setBranchesLoading(false)
        }
      })()
    return () => {
      cancelled = true
    }
  }, [selectedChannelIds, selectedSubChannelIds])

  useEffect(() => {
    let cancelled = false
    if (
      !selectedChannelIds.length ||
      !selectedSubChannelIds.length ||
      !selectedBranchIds.length
    ) {
      setDesignationOptions([])
      setDesignationsLoading(false)
      return
    }
    setDesignationsLoading(true)
      ; (async () => {
        try {
          const res: any = await incentiveService.getFiltersCascade({
            channelIds: selectedChannelIds,
            subChannelIds: selectedSubChannelIds,
            branchIds: selectedBranchIds,
          })
          const rows = extractCascadeRows(res?.responseBody, [
            'designations',
            'designationList',
            'designation',
          ])
          const opts = mapCascadeOptions(rows, ['id', 'designationId'], [
            'name',
            'designationName',
            'label',
            'code',
          ])
          if (!cancelled) setDesignationOptions(opts)
        } catch (err: any) {
          if (!cancelled) {
            setDesignationOptions([])
            const message =
              err?.response?.data?.message ||
              err?.response?.data?.errorMessage ||
              err?.message ||
              'Failed to load designations'
            showToast(NOTIFICATION_CONSTANTS.ERROR, message)
          }
        } finally {
          if (!cancelled) setDesignationsLoading(false)
        }
      })()
    return () => {
      cancelled = true
    }
  }, [selectedChannelIds, selectedSubChannelIds, selectedBranchIds])

  const toIso = (value: string | null) => {
    if (!value) return null
    const parsed = parse(value, 'dd LLL yyyy', new Date())
    if (Number.isNaN(parsed.getTime())) return null
    return parsed.toISOString()
  }

  const extractProgramId = (res: any): number | null => {
    const candidates = [
      res?.responseBody?.incentiveProgram?.programId,
      res?.responseBody?.incentiveProgram?.id,
      res?.responseBody?.programId,
      res?.responseBody?.programID,
      res?.responseBody?.ProgramId,
      res?.responseBody?.program_id,
      res?.responseBody?.id,
      res?.responseBody?.program?.id,
      res?.responseBody?.program?.programId,
      res?.responseBody?.data?.programId,
      res?.responseBody?.data?.id,
      res?.programId,
      res?.programID,
      res?.id,
      res?.data?.programId,
      res?.data?.id,
    ]
    for (const c of candidates) {
      const n = Number(c)
      if (Number.isFinite(n) && n > 0) return n
    }
    return null
  }

  const handleSaveProgram = async () => {
    const name = programName.trim()
    if (!name) {
      showToast(NOTIFICATION_CONSTANTS.ERROR, 'Program Name is required')
      return
    }

    const programCategoryLabel = programCategoryForApi(programDetailTab)

    const effectiveFrom = toIso(startDate)
    const effectiveTo = toIso(endDate)

    if (!effectiveFrom) {
      showToast(NOTIFICATION_CONSTANTS.ERROR, 'Start Date is required')
      return
    }
    if (programType === 'one_time' && !effectiveTo) {
      showToast(NOTIFICATION_CONSTANTS.ERROR, 'End Date is required for a one-time program')
      return
    }
    if (programDetailTab === 'fresher') {
      const anySelected = fresherSelectedMonths.some(Boolean)
      if (!anySelected) {
        showToast(NOTIFICATION_CONSTANTS.ERROR, 'Fresher program: select at least one month (M1–M6).')
        return
      }
      for (let i = 0; i < 6; i++) {
        if (!fresherSelectedMonths[i]) continue
        const t = fresherTargetsInput[i] ?? { logins: '', conversions: '', amount: '' }
        const monthLabel = `M${i + 1}`
        if (!String(t.logins ?? '').trim()) {
          showToast(NOTIFICATION_CONSTANTS.ERROR, `Fresher program: enter Logins(count) for ${monthLabel}.`)
          return
        }
        if (!String(t.conversions ?? '').trim()) {
          showToast(NOTIFICATION_CONSTANTS.ERROR, `Fresher program: enter Conversions for ${monthLabel}.`)
          return
        }
        if (!String(t.amount ?? '').trim()) {
          showToast(NOTIFICATION_CONSTANTS.ERROR, `Fresher program: enter Amount for ${monthLabel}.`)
          return
        }
      }
    }

    const conv = parseInt(conversionPeriodDays, 10)
    const canc = parseInt(cancellationPeriodDays, 10)
    const cappingAmountNum = parseFloat(cappingAmount) || 0
    const normalizeFrequencyLabel = (value: string) => {
      const v = String(value ?? '').trim()
      if (!v) return ''
      const upper = v.toUpperCase()
      // Common values used in UI/DB; API examples show Title Case.
      if (upper === 'MONTHLY') return 'Monthly'
      if (upper === 'WEEKLY') return 'Weekly'
      if (upper === 'QUARTERLY') return 'Quarterly'
      if (upper === 'HALF_YEARLY' || upper === 'HALFYEARLY') return 'Half Yearly'
      return v
    }

    setIsSaving(true)
    try {
      const res: any = await incentiveService.upsertProgram({
        ...(isEditMode && programId ? { programId } : {}),
        programName: name,
        description: description.trim(),
        effectiveFrom,
        effectiveTo:
          programType === 'perpetual' ? (effectiveTo ?? null) : (effectiveTo as string),
        executionFrequency: normalizeFrequencyLabel(cronValue || executionFrequency),
        selectionExpression: selectionExpression.trim() ? selectionExpression.trim() : null,
        cappingAmount: cappingAmountNum,
        programCategory: programCategoryLabel,
        programType: programType === 'one_time' ? 'One Time' : 'Perpetual',
        conversionPeriod: Number.isFinite(conv) && conv >= 0 ? conv : undefined,
        cancellationPeriod: Number.isFinite(canc) && canc >= 0 ? canc : undefined,
        considerClawback: clawbackConsidered,
        clawbackPeriod: clawbackConsidered ? clawbackPeriodForApi(clawbackBasis) : undefined,
        kpiIds: selectedKpiIds,
        ...(programType === 'perpetual'
          ? { incentiveFrequency: mapIncentiveFrequencyForApi(incentiveFrequency) }
          : {}),
        ...(programDetailTab === 'fresher'
          ? {
              catchUpPreviousQualification: fresherCatchUpPrevious,
              earlyBonus: fresherEarlyBonus,
              fresherTargets: fresherTargetsInput
                .slice(0, 6)
                .map((t, idx) => ({ t, idx }))
                .filter(({ idx }) => Boolean(fresherSelectedMonths[idx]))
                .map(({ t, idx }) => ({
                  targetId: 0,
                  monthIdentifier: `M${idx + 1}`,
                  logins: toNonNegativeInt(t?.logins),
                  conversions: toNonNegativeInt(t?.conversions),
                  amount: toNonNegativeNumber(t?.amount),
                  // Keep these for backward compatibility with any older backend versions.
                  targetDescription: `logins(count): ${String(t?.logins ?? '').trim()}, conversions: ${String(
                    t?.conversions ?? '',
                  ).trim()}, amount: ${String(t?.amount ?? '').trim()}`,
                  isActive: true,
                })),
            }
          : {}),
      })

      const programmeID = res?.responseBody?.incentiveProgram?.programId
      setProgrammeId(programmeID)

      const id = extractProgramId(res)
      if (id) setProgramId(id)
      if (id) {
        showToast(
          NOTIFICATION_CONSTANTS.SUCCESS,
          isEditMode ? 'Program updated successfully' : 'Program saved successfully',
        )
        if (isEditMode) {
          navigate({ to: '/search/incentive/programs' as any })
        }
      } else {
        showToast(
          NOTIFICATION_CONSTANTS.WARNING,
          'Program saved, but programId was not found in the response. Save weightages will need programId — check API response shape.',
        )
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errorMessage ||
        err?.message ||
        'Failed to save program'
      showToast(NOTIFICATION_CONSTANTS.ERROR, message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveWeightages = async () => {
    if (!programId) {
      showToast(
        NOTIFICATION_CONSTANTS.ERROR,
        'Please save Program Details first so we have programId from UpsertProgram',
      )
      return
    }

    // UpsertProgramWeightages: { programId, weightageIds: number[] }
    const selectedIds = weightageOptions
      .filter((o) => Boolean(weightage[o.key]))
      .map((o) => {
        if (o.id != null && Number.isFinite(Number(o.id)) && Number(o.id) > 0) {
          return Number(o.id)
        }
        const fromKey = Number(o.key)
        if (Number.isFinite(fromKey) && fromKey > 0) return fromKey
        return null
      })
      .filter((n): n is number => n != null)

    if (!selectedIds.length) {
      showToast(
        NOTIFICATION_CONSTANTS.ERROR,
        'Please select at least one weightage (each item needs a numeric id from GetWeightages)',
      )
      return
    }

    setIsSavingWeightages(true)
    try {
      await incentiveService.upsertProgramWeightages({
        programId,
        weightageIds: selectedIds,
      })
      showToast(NOTIFICATION_CONSTANTS.SUCCESS, 'Weightages saved successfully')
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errorMessage ||
        err?.message ||
        'Failed to save weightages'
      showToast(NOTIFICATION_CONSTANTS.ERROR, message)
    } finally {
      setIsSavingWeightages(false)
    }
  }

  const handleSaveFilters = async () => {
    if (!programId) {
      showToast(
        NOTIFICATION_CONSTANTS.ERROR,
        'Please save Program Details first so we have programId',
      )
      return
    }

    if (!selectedChannelIds.length || !primaryCascadeChannelId) {
      showToast(NOTIFICATION_CONSTANTS.ERROR, 'Please select a channel')
      return
    }

    setIsSavingFilters(true)
    try {
      await incentiveService.upsertProgramFilters({
        programId,
        filters: [
          {
            filterId: 0,
            programId,
            channelIds: selectedChannelIds,
            subChannelIds: selectedSubChannelIds,
            branchIds: selectedBranchIds,
            designationIds: selectedDesignationIds,
            isActive: true,
          },
        ],
      })
      showToast(NOTIFICATION_CONSTANTS.SUCCESS, 'Filters saved successfully')
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errorMessage ||
        err?.message ||
        'Failed to save filters'
      showToast(NOTIFICATION_CONSTANTS.ERROR, message)
    } finally {
      setIsSavingFilters(false)
    }
  }

  const handleSaveClubs = async () => {
    if (!programId) {
      showToast(
        NOTIFICATION_CONSTANTS.ERROR,
        'Please save Program Details first so we have programId',
      )
      return
    }

    setIsSavingClubs(true)
    try {
      await incentiveService.upsertProgramClubs({
        programId,
        clubIds: selectedClubIds,
      })
      showToast(NOTIFICATION_CONSTANTS.SUCCESS, 'Club eligibility saved successfully')
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errorMessage ||
        err?.message ||
        'Failed to save club eligibility'
      showToast(NOTIFICATION_CONSTANTS.ERROR, message)
    } finally {
      setIsSavingClubs(false)
    }
  }

  // Fetch designations from API when branches change
  const fetchDesignations = useCallback(async (branches: string[]) => {
    if (branches.length === 0) return
    setDesignationsLoading(true)
    try {
      const result = await incentiveService.getFilters({ branchIds: branches })
      const map: Record<string, string[]> = {}
        ; (result ?? []).forEach((item) => {
          map[item.branchId] = item.designations.map((d) => d.name)
          if (item.branchName) {
            map[item.branchName] = item.designations.map((d) => d.name)
          }
        })
      setApiDesignations(map)
    } catch (err) {
      console.error('Failed to load designations from API:', err)
    } finally {
      setDesignationsLoading(false)
    }
  }, [])

  // Re-fetch designations whenever selected branches change
  useEffect(() => {
    if (agentFilter.branches.length > 0) {
      fetchDesignations(agentFilter.branches)
    }
  }, [agentFilter.branches, fetchDesignations])

  const updateSlab = (id: string, updates: Partial<SlabState>) => {
    setSlabs((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const addSlab = () => {
    const newSlab = createSlab()
    setSlabs((prev) => [...prev, newSlab])
    setActiveSlabId(newSlab.id)
  }

  const removeSlab = (id: string) => {
    setSlabs((prev) => {
      const next = prev.filter((s) => s.id !== id)
      if (activeSlabId === id && next.length > 0) {
        setActiveSlabId(next[next.length - 1].id)
      }
      return next
    })
  }

  const reorderSlabs = useCallback((sourceId: string, targetId: string) => {
    if (!sourceId || !targetId || sourceId === targetId) return
    setSlabs((prev) => {
      const sourceIndex = prev.findIndex((s) => s.id === sourceId)
      const targetIndex = prev.findIndex((s) => s.id === targetId)
      if (sourceIndex < 0 || targetIndex < 0) return prev
      const next = [...prev]
      const [moved] = next.splice(sourceIndex, 1)
      next.splice(targetIndex, 0, moved)
      return next
    })
  }, [])

  const activeSlab = slabs.find((s) => s.id === activeSlabId) ?? slabs[0]

  const isAllValid = slabs.every((s) => {
    if (s.programName.trim() === '' || s.startDate === '' || s.endDate === '') return false
    if (s.criteriaTab === 'expression') return s.selectionExpression.trim() !== ''
    return s.selectedKPIs.length > 0
  })

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      // Map each slab to a separate program creation request
      for (const s of slabs) {
        const filters = agentFilter.branches.length > 0
          ? agentFilter.branches.map((branchId) => ({
            branchId,
            designationIds: agentFilter.designations,
          }))
          : []
        await incentiveService.createProgram({
          name: s.programName,
          description: s.programDescription,
          startDate: s.startDate,
          endDate: s.endDate,
          filters,
          kpiWeightages: s.selectedKPIs.map((k) => ({ kpiId: k.kpiId, weight: k.weight })),
        })
      }
      setSaveSuccess(true)
    } catch (err) {
      console.error('Failed to save program:', err)
      setSaveError('Failed to save. Please check your inputs and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
           
            <div className="flex items-center gap-2">
              <h1 className="truncate text-2xl font-semibold text-neutral-900">
                Program Configuration
              </h1>
            </div>
            <p className="mt-1 text-sm text-neutral-600">
              Configure incentive slabs with agent filters, eligibility cycles,
              and calculation formulas.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="rounded-md border border-neutral-200">
            <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 py-3">
              <div>
                <CardTitle className="text-lg font-semibold">
                  Program Details
                </CardTitle>
                <p className="mt-1 text-xs text-neutral-500">
                  Pick a program category (same fields on each tab for now), then set schedule,
                  periods, and clawback rules.
                </p>
              </div>
              {/* <MdOutlineInfo className="mt-1 h-4 w-4 text-neutral-400" /> */}
            </CardHeader>

            <CardContent className="px-4 pb-4">
              <Tabs
                value={programDetailTab}
                onValueChange={(v) => setProgramDetailTab(v as ProgramDetailCategory)}
                className="w-full"
              >
                <TabsList className="mb-4 grid h-auto w-full grid-cols-2 gap-1 rounded-lg bg-neutral-100 p-1 sm:grid-cols-3 lg:grid-cols-5">
                  {PROGRAM_DETAIL_TABS.map((t) => (
                    <TabsTrigger
                      key={t.id}
                      value={t.id}
                      className="whitespace-normal px-2 py-2 text-center text-[11px] leading-tight sm:text-xs"
                    >
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Input
                      label="Program Name *"
                      value={programName}
                      onChange={(e) => setProgramName(e.target.value)}
                      placeholder="e.g., Q1 2025 Sales Excellence Program"
                      variant="standardone"
                      disabled={isEditMode || loadingProgram}
                    />
                    {isEditMode ? (
                      <p className="mt-1 text-xs text-neutral-500">
                        Program Name cannot be changed while editing.
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Description
                    </label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the objectives and scope of this incentive program..."
                      className="min-h-[96px] bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label className="mb-1.5 block text-sm font-medium text-neutral-700">
                        Program Type *
                      </Label>
                      <Select
                        value={programType}
                        onValueChange={(v) => setProgramType(v as ProgramScheduleType)}
                      >
                        <SelectTrigger className="h-10 w-full bg-white">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="perpetual">Perpetual</SelectItem>
                          <SelectItem value="one_time">One Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-3">
                      <p className="mb-2 text-sm font-medium text-neutral-800">
                        Should clawback / recoveries be considered?
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name="clawback-yn"
                            checked={!clawbackConsidered}
                            onChange={() => setClawbackConsidered(false)}
                            className="h-4 w-4 border-neutral-300 text-teal-600"
                          />
                          No
                        </label>
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name="clawback-yn"
                            checked={clawbackConsidered}
                            onChange={() => setClawbackConsidered(true)}
                            className="h-4 w-4 border-neutral-300 text-teal-600"
                          />
                          Yes
                        </label>
                      </div>

                      {clawbackConsidered ? (
                        <div className="mt-3 border-t border-neutral-200 pt-3">
                          <p className="mb-2 text-xs font-medium text-neutral-600">Clowback From</p>
                          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                            {(
                              [
                                ['itd', 'ITD'],
                                ['fytd', 'FYTD'],
                                ['cytd', 'CYTD'],
                              ] as const
                            ).map(([value, label]) => (
                              <label
                                key={value}
                                className="flex cursor-pointer items-center gap-2 text-sm text-neutral-800"
                              >
                                <input
                                  type="radio"
                                  name="clawback-basis"
                                  checked={clawbackBasis === value}
                                  onChange={() => setClawbackBasis(value)}
                                  className="h-4 w-4 border-neutral-300 text-teal-600"
                                />
                                {label}
                              </label>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {programType === 'perpetual' ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label className="mb-1.5 block text-sm font-medium text-neutral-700">
                          Frequency *
                        </Label>
                        <Select
                          value={incentiveFrequency}
                          onValueChange={(v) => setIncentiveFrequency(v as IncentiveFrequency)}
                        >
                          <SelectTrigger className="h-10 w-full bg-white">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="half_yearly">Half yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="hidden md:block" aria-hidden />
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <DatePicker
                      label="Start Date *"
                      value={startDate}
                      onChange={setStartDate}
                      placeholder="dd-mm-yyyy"
                    />
                    <DatePicker
                      label={programType === 'perpetual' ? 'End Date (optional)' : 'End Date *'}
                      value={endDate}
                      onChange={setEndDate}
                      placeholder="dd-mm-yyyy"
                    />
                    <div>
                      <label className="mb-1 block text-sm font-medium text-neutral-700">
                        Capping Amount
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        placeholder="e.g., 50000"
                        value={cappingAmount}
                        onChange={(e) => setCappingAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-neutral-700">
                        Conversion Period
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                          placeholder="e.g., 5"
                          value={conversionPeriodDays}
                          onChange={(e) => setConversionPeriodDays(e.target.value)}
                        />
                        <span className="shrink-0 text-xs text-neutral-500">days after end date</span>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-neutral-700">
                        Cancellation Period
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                          placeholder="e.g., 5"
                          value={cancellationPeriodDays}
                          onChange={(e) => setCancellationPeriodDays(e.target.value)}
                        />
                        <span className="shrink-0 text-xs text-neutral-500">days after conversion</span>
                      </div>
                    </div>
                  </div>

                  {programDetailTab === 'fresher' ? (
                    <div className="space-y-4 rounded-lg border border-violet-200 bg-violet-50/40 p-4">
                      <p className="text-sm font-semibold text-violet-900">Fresher program options</p>

                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-neutral-800">
                              Monthly targets (M1–M6)
                            </Label>
                            <p className="mt-1 text-xs text-neutral-500">
                              Select months (M1–M6). Targets are required only for selected months.
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {Array.from({ length: 6 }).map((_, idx) => {
                                const checked = Boolean(fresherSelectedMonths[idx])
                                return (
                                  <label
                                    key={idx}
                                    className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                      checked
                                        ? 'border-violet-500 bg-white text-violet-900 shadow-sm'
                                        : 'border-neutral-200 bg-white/80 text-neutral-600 hover:bg-white'
                                    }`}
                                  >
                                    <Checkbox
                                      checked={checked}
                                      onCheckedChange={(c) => {
                                        const on = Boolean(c)
                                        setFresherSelectedMonths((prev) => {
                                          const next = prev.slice(0, 6)
                                          while (next.length < 6) next.push(false)
                                          next[idx] = on
                                          return next
                                        })
                                      }}
                                      className="h-3.5 w-3.5"
                                    />
                                    M{idx + 1}
                                  </label>
                                )
                              })}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() =>
                                  setFresherSelectedMonths(Array.from({ length: 6 }, () => true))
                                }
                              >
                                Select all
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() =>
                                  setFresherSelectedMonths(Array.from({ length: 6 }, () => false))
                                }
                              >
                                Clear
                              </Button>
                            </div>
                          </div>

                          <div className="rounded-lg border border-violet-200 bg-white/70 p-3">
                            <p className="mb-2 text-sm font-medium text-neutral-800">
                              Catch up of previous qualification
                            </p>
                            <div className="flex flex-wrap gap-4">
                              <label className="flex cursor-pointer items-center gap-2 text-sm">
                                <input
                                  type="radio"
                                  name="fresher-catchup"
                                  checked={!fresherCatchUpPrevious}
                                  onChange={() => setFresherCatchUpPrevious(false)}
                                  className="h-4 w-4 border-neutral-300 text-violet-600"
                                />
                                No
                              </label>
                              <label className="flex cursor-pointer items-center gap-2 text-sm">
                                <input
                                  type="radio"
                                  name="fresher-catchup"
                                  checked={fresherCatchUpPrevious}
                                  onChange={() => setFresherCatchUpPrevious(true)}
                                  className="h-4 w-4 border-neutral-300 text-violet-600"
                                />
                                Yes
                              </label>
                            </div>
                          </div>

                          <div className="rounded-lg border border-violet-200 bg-white/70 p-3">
                            <p className="mb-2 text-sm font-medium text-neutral-800">Early bonus</p>
                            <div className="flex flex-wrap gap-4">
                              <label className="flex cursor-pointer items-center gap-2 text-sm">
                                <input
                                  type="radio"
                                  name="fresher-early-bonus"
                                  checked={!fresherEarlyBonus}
                                  onChange={() => setFresherEarlyBonus(false)}
                                  className="h-4 w-4 border-neutral-300 text-violet-600"
                                />
                                No
                              </label>
                              <label className="flex cursor-pointer items-center gap-2 text-sm">
                                <input
                                  type="radio"
                                  name="fresher-early-bonus"
                                  checked={fresherEarlyBonus}
                                  onChange={() => setFresherEarlyBonus(true)}
                                  className="h-4 w-4 border-neutral-300 text-violet-600"
                                />
                                Yes
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-lg border border-violet-200 bg-white/70 p-3">
                          <div className="grid grid-cols-1 gap-3">
                            <div className="hidden grid-cols-4 gap-3 text-xs font-medium text-neutral-600 md:grid">
                              <div>Month</div>
                              <div>Logins(count)</div>
                              <div>Conversions</div>
                              <div>Amount</div>
                            </div>

                            {Array.from({ length: 6 }).map((_, idx) => {
                              const t =
                                fresherTargetsInput[idx] ?? { logins: '', conversions: '', amount: '' }
                              const selected = Boolean(fresherSelectedMonths[idx])
                              if (!selected) return null
                              return (
                                <div
                                  key={idx}
                                  className="grid grid-cols-1 gap-2 rounded-lg border border-violet-100 bg-white/90 p-3 shadow-sm md:grid-cols-4 md:items-center md:gap-3"
                                >
                                  <div className="text-sm font-medium text-violet-950">M{idx + 1}</div>
                                  <Input
                                    label=""
                                    type="number"
                                    inputMode="numeric"
                                    value={t.logins}
                                    variant="standardone"
                                    onChange={(e) => {
                                      const v = e.target.value
                                      setFresherTargetsInput((prev) => {
                                        const next = prev.slice()
                                        while (next.length < 6)
                                          next.push({ logins: '', conversions: '', amount: '' })
                                        next[idx] = { ...next[idx], logins: v }
                                        return next
                                      })
                                    }}
                                    placeholder="0"
                                  />
                                  <Input
                                    label=""
                                    type="number"
                                    inputMode="numeric"
                                    value={t.conversions}
                                    variant="standardone"
                                    onChange={(e) => {
                                      const v = e.target.value
                                      setFresherTargetsInput((prev) => {
                                        const next = prev.slice()
                                        while (next.length < 6)
                                          next.push({ logins: '', conversions: '', amount: '' })
                                        next[idx] = { ...next[idx], conversions: v }
                                        return next
                                      })
                                    }}
                                    placeholder="0"
                                  />
                                  <Input
                                    label=""
                                    type="number"
                                    inputMode="decimal"
                                    value={t.amount}
                                    variant="standardone"
                                    onChange={(e) => {
                                      const v = e.target.value
                                      setFresherTargetsInput((prev) => {
                                        const next = prev.slice()
                                        while (next.length < 6)
                                          next.push({ logins: '', conversions: '', amount: '' })
                                        next[idx] = { ...next[idx], amount: v }
                                        return next
                                      })
                                    }}
                                    placeholder="0"
                                  />
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <label className="block text-sm font-medium text-neutral-700">
                        Choose The KPI&apos;s
                      </label>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => navigate({ to: '/search/incentive/kpis' as any })}
                        className="h-8 px-3 text-xs"
                      >
                        View KPI List
                      </Button>
                    </div>
                    <MultiSelectInline
                      options={kpisListOptions}
                      placeholder="Search KPIs..."
                      onChange={(ids) => {
                        setSelectedKpiIds(ids)
                      }}
                    />
                  </div>
                </div>
              </Tabs>
              <div className="mt-10">
                <div className="">
                  <CardTitle className="text-lg mb-2 font-semibold">
                    Execution Frequency
                  </CardTitle>
                  <p className="my-2 text-xs text-neutral-500">
                    Choose Instant, Daily, Weekly (multiple times per day on selected weekdays), or
                    monthly day-of-month. Add several run times; each generates a Quartz expression,
                    combined with &quot; | &quot;.
                  </p>
                </div>

                <CardContent className="px-0 pb-4">
                  <IncentiveConfig
                    commissionConfigId={0}
                    initialData={null}
                    isEditMode={false}
                    onCronChange={(cron) => {
                      setCronValue(cron)
                    }}
                  />
                </CardContent>
              </div>

              <div className="mt-4 flex items-center justify-end">
                <Button
                  variant="blue"
                  onClick={handleSaveProgram}
                  isLoading={isSaving}
                  disabled={isSaving}
                  loadingText="Saving..."
                >
                  {isEditMode ? 'Update' : 'Save'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-md border border-neutral-200">
            <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 py-3">
              <div>
                <CardTitle className="text-base font-semibold">
                  Agent Filter
                </CardTitle>
                <p className="mt-1 text-xs text-neutral-500">
                  Select channel, sub-channel, branches, and designations to
                  determine which agents are eligible for this incentive
                  program.
                </p>
              </div>
              <FiFilter className="mt-1 h-4 w-4 text-neutral-400" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="md:col-span-1">
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Channel <span className="text-red-600">*</span>
                  </label>
                  <div className="rounded-md border border-neutral-200 bg-white p-3">
                    <div className="max-h-40 space-y-2 overflow-auto pr-1">
                      {channelsLoading ? (
                        <p className="text-xs text-neutral-500">Loading…</p>
                      ) : channelOptions.length === 0 ? (
                        <p className="text-xs text-neutral-500">
                          No channels found
                        </p>
                      ) : (
                        channelOptions.map((c) => (
                        <label
                          key={c.id}
                          className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700"
                        >
                          <Checkbox
                            checked={selectedChannelIds.includes(c.id)}
                            onCheckedChange={(checked) => {
                              const isChecked = Boolean(checked)
                              setSelectedChannelIds((prev) => {
                                if (isChecked) {
                                  return prev.includes(c.id) ? prev : [...prev, c.id]
                                }
                                return prev.filter((id) => id !== c.id)
                              })
                            }}
                          />
                          {c.label}
                        </label>
                      ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Sub Channel <span className="text-red-600">*</span>
                  </label>
                  <div className="rounded-md border border-neutral-200 bg-white p-3">
                    {!anyChannelSelected ? (
                      <p className="text-xs text-neutral-500">
                        Select Channel first
                      </p>
                    ) : subChannelsLoading ? (
                      <p className="text-xs text-neutral-500">Loading…</p>
                    ) : subChannelOptions.length === 0 ? (
                      <p className="text-xs text-neutral-500">
                        No sub-channels
                      </p>
                    ) : (
                      <div className="max-h-40 space-y-2 overflow-auto pr-1">
                        {subChannelOptions.map((o) => (
                          <label
                            key={o.id}
                            className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700"
                          >
                            <Checkbox
                              checked={selectedSubChannelIds.includes(o.id)}
                              onCheckedChange={(checked) => {
                                const isChecked = Boolean(checked)
                                setSelectedSubChannelIds((prev) => {
                                  if (isChecked) {
                                    return prev.includes(o.id)
                                      ? prev
                                      : [...prev, o.id]
                                  }
                                  return prev.filter((id) => id !== o.id)
                                })
                              }}
                            />
                            {o.label}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-1">
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Branches
                  </label>
                  <div className="rounded-md border border-neutral-200 bg-white p-3">
                    {!selectedSubChannelIds.length ? (
                      <p className="text-xs text-neutral-500">
                        Select Sub Channel first
                      </p>
                    ) : branchesLoading ? (
                      <p className="text-xs text-neutral-500">Loading…</p>
                    ) : branchOptions.length === 0 ? (
                      <p className="text-xs text-neutral-500">No branches</p>
                    ) : (
                      <div className="max-h-40 space-y-2 overflow-auto pr-1">
                        {branchOptions.map((o) => (
                          <label
                            key={o.id}
                            className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700"
                          >
                            <Checkbox
                              checked={selectedBranchIds.includes(o.id)}
                              onCheckedChange={(checked) => {
                                const isChecked = Boolean(checked)
                                setSelectedBranchIds((prev) => {
                                  if (isChecked) {
                                    return prev.includes(o.id)
                                      ? prev
                                      : [...prev, o.id]
                                  }
                                  return prev.filter((id) => id !== o.id)
                                })
                              }}
                            />
                            {o.label}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-1">
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Designations
                  </label>
                  <div className="rounded-md border border-neutral-200 bg-white p-3">
                    {!selectedBranchIds.length ? (
                      <p className="text-xs text-neutral-500">
                        Select Branch first
                      </p>
                    ) : designationsLoading ? (
                      <p className="text-xs text-neutral-500">Loading…</p>
                    ) : designationOptions.length === 0 ? (
                      <p className="text-xs text-neutral-500">
                        No designations
                      </p>
                    ) : (
                      <div className="max-h-40 space-y-2 overflow-auto pr-1">
                        {designationOptions.map((o) => (
                          <label
                            key={o.id}
                            className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700"
                          >
                            <Checkbox
                              checked={selectedDesignationIds.includes(o.id)}
                              onCheckedChange={(checked) => {
                                const isChecked = Boolean(checked)
                                setSelectedDesignationIds((prev) => {
                                  if (isChecked) {
                                    return prev.includes(o.id)
                                      ? prev
                                      : [...prev, o.id]
                                  }
                                  return prev.filter((id) => id !== o.id)
                                })
                              }}
                            />
                            {o.label}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end">
                <Button
                  variant="blue"
                  onClick={handleSaveFilters}
                  isLoading={isSavingFilters}
                  disabled={isSavingFilters}
                  loadingText="Saving..."
                >
                  Save Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-md border border-neutral-200">
            <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 py-3">
              <div>
                <CardTitle className="text-base font-semibold">
                  Clubs
                </CardTitle>
                <p className="mt-1 text-xs text-neutral-500">
                  Select one or more clubs. Agents who belong to any selected club
                  are eligible for this incentive program (in addition to other
                  eligibility rules).
                </p>
              </div>
              <FiUsers className="mt-1 h-4 w-4 text-neutral-400" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="max-w-xl">
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Eligible clubs
                </label>
                <div className="rounded-md border border-neutral-200 bg-white p-3">
                  {clubsLoading ? (
                    <p className="text-xs text-neutral-500">Loading…</p>
                  ) : clubOptions.length === 0 ? (
                    <p className="text-xs text-neutral-500">
                      No clubs are available right now.
                    </p>
                  ) : (
                    <div className="max-h-40 space-y-2 overflow-auto pr-1">
                      {clubOptions.map((c) => (
                        <label
                          key={c.id}
                          className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700"
                        >
                          <Checkbox
                            checked={selectedClubIds.includes(c.id)}
                            onCheckedChange={(checked) => {
                              const isChecked = Boolean(checked)
                              setSelectedClubIds((prev) => {
                                if (isChecked) {
                                  return prev.includes(c.id) ? prev : [...prev, c.id]
                                }
                                return prev.filter((id) => id !== c.id)
                              })
                            }}
                          />
                          {c.label}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end">
                <Button
                  variant="blue"
                  onClick={handleSaveClubs}
                  isLoading={isSavingClubs}
                  disabled={isSavingClubs}
                  loadingText="Saving..."
                >
                  Save clubs
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <CardHeader className="px-5 pb-2 pt-5 border-b border-neutral-200">
              <CardTitle className="text-base">Slab Configuration</CardTitle>
              <p className="mt-0.5 text-xs text-neutral-500">
                Select a slab from the left panel to configure its details on the right.
              </p>
            </CardHeader>
            <div className="flex min-h-[600px]">
              {/* Left Panel — Slab List */}
              <div className="w-52 shrink-0 border-r border-neutral-200 bg-neutral-50 flex flex-col">
                {/* Add Slab Button — at the top for easy access */}
                <div className="border-b border-neutral-200 p-3">
                  <button
                    type="button"
                    onClick={addSlab}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 py-2 text-xs font-medium text-neutral-500 transition hover:border-teal-400 hover:text-teal-600"
                  >
                    <FiPlus className="h-3.5 w-3.5" />
                    Add Slab
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto py-2">
                  {slabs.map((slab, index) => {
                    const isActive = slab.id === (activeSlab?.id ?? '')
                    const hasName = slab.programName.trim() !== ''
                    return (
                      <div
                        key={slab.id}
                        draggable
                        onDragStart={(e) => {
                          dragSlabIdRef.current = slab.id
                          setDragOverSlabId(null)
                          e.dataTransfer.effectAllowed = 'move'
                          try {
                            e.dataTransfer.setData('text/plain', slab.id)
                          } catch {
                            // ignore (older browsers / security settings)
                          }
                        }}
                        onDragOver={(e) => {
                          e.preventDefault()
                          if (dragOverSlabId !== slab.id) setDragOverSlabId(slab.id)
                          e.dataTransfer.dropEffect = 'move'
                        }}
                        onDragLeave={() => {
                          setDragOverSlabId((prev) => (prev === slab.id ? null : prev))
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          const sourceId =
                            dragSlabIdRef.current ??
                            (() => {
                              try {
                                return e.dataTransfer.getData('text/plain')
                              } catch {
                                return ''
                              }
                            })()
                          reorderSlabs(sourceId, slab.id)
                          dragSlabIdRef.current = null
                          setDragOverSlabId(null)
                        }}
                        onDragEnd={() => {
                          dragSlabIdRef.current = null
                          setDragOverSlabId(null)
                        }}
                        className={`group relative flex w-full items-center justify-between gap-2 px-2 py-2 text-left text-sm transition border-l-2 ${isActive
                          ? 'border-l-teal-500 bg-teal-50 font-semibold text-teal-700 shadow-sm'
                          : 'border-l-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
                          } ${dragOverSlabId === slab.id ? 'ring-2 ring-teal-200' : ''}`}
                      >
                        <button
                          type="button"
                          aria-label="Drag to reorder slab"
                          title="Drag to reorder"
                          onClick={(e) => e.stopPropagation()}
                          className="mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-white hover:text-neutral-600"
                        >
                          <FiMenu className="h-4 w-4" />
                        </button>

                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${isActive ? 'text-teal-600' : 'text-neutral-500'}`}>
                            Slab {index + 1}
                          </p>
                          {isActive ? (
                            <Input
                              label=""
                              value={slab.programName}
                              placeholder="Slab name"
                              onChange={(e) => updateSlab(slab.id, { programName: e.target.value })}
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveSlabId(slab.id)
                              }}
                              variant="standardone"
                              className="h-5 text-sm"
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => setActiveSlabId(slab.id)}
                              className={`block w-full text-left truncate text-sm ${hasName ? 'text-neutral-800' : 'text-neutral-400 italic'}`}
                              title={hasName ? slab.programName : 'Untitled'}
                            >
                              {hasName ? slab.programName : 'Untitled'}
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveSlabId(slab.id)}
                          className="flex items-center justify-center"
                          aria-label="Select slab"
                        >
                          {isActive && <FiChevronRight className="h-3.5 w-3.5 shrink-0 text-teal-500" />}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right Panel — Active Slab Config */}
              <div className="flex-1 overflow-y-auto">
                {activeSlab ? (
                  <SlabSection
                    key={activeSlab.id}
                    slab={activeSlab}
                    slabNumber={slabs.findIndex((s) => s.id === activeSlab.id) + 1}
                    canRemove={slabs.length > 1}
                    onChange={(updates) => updateSlab(activeSlab.id, updates)}
                    onRemove={() => removeSlab(activeSlab.id)}
                    kpiLibrary={kpiLibrary}
                    kpiLibraryLoading={kpiLibraryLoading}
                    onRefreshProgramKpis={refreshProgramKpis}
                    programId={programId}
                    programmeId={programmeId}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-10 text-center">
                    <div>
                      <p className="text-sm font-medium text-neutral-500">No slab selected</p>
                      <p className="mt-1 text-xs text-neutral-400">Add a slab to get started.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() =>
                navigate({
                  to: (isEditMode ? '/search/incentive/programs' : '/search/incentive') as any,
                })
              }
            >
              {isEditMode ? 'Back to Programs' : 'Back to Incentive'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

