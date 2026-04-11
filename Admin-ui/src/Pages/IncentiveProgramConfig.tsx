import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { MdOutlineInfo } from 'react-icons/md'
import { FiChevronRight, FiCode, FiDatabase, FiFilter, FiInfo, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi'
import { useNavigate } from '@tanstack/react-router'
import { parse } from 'date-fns'

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
import type { IKpi, IIncentiveProgram } from '@/models/incentive'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  QueryBuilder,
  buildFieldsFromKpi,
  buildFieldsFromSelectedKpis,
  createEmptyGroup,
  queryGroupToSql,
  toVarName,
  type QueryGroupNode,
} from '@/components/query-builder'
import { useTableSchema } from '@/hooks/useTableSchema'
import { IncentiveConfig } from '@/components/incentives/IncentiveConfig'
import { AddUserInline } from '@/components/incentives/AddUserDialog'
import { MultiSelectInline } from '@/components/incentives/MultiSelectInline'
import DataTable from '@/components/table/DataTable'

type WeightageOption = { key: string; id: number | null; label: string }

type CascadeOption = { id: number; label: string }

type PastQualificationRow = Record<string, unknown>

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

/** Radix Select requires a non-empty value for “no selection”. */
const CASCADE_NONE = '__cascade_none__'

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
  criteriaTab: 'selected-kpi' | 'expression' | 'table-filter'
  /** JSON query tree for Selection Expression tab (slab-wide) */
  selectionQuery: QueryGroupNode
  selectionExpression: string
  /** Per–selected-KPI filter query (JSON) */
  kpiCriteriaQueries: Record<string, QueryGroupNode>
  incentiveExpression: string
  /** Table name selected in the Table Filter tab */
  selectedFilterTable: string
  /** JSON query tree for the Table Filter tab */
  tableFilterQuery: QueryGroupNode
}

// ─── Agent Filter Types ───────────────────────────────────────────────────────

interface AgentFilterState {
  channels: string[]
  subChannels: string[]
  branches: string[]
  designations: string[]
}

interface PastCycle {
  date: string
  name: string
  executionDate: string
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


interface SlabSectionProps {
  slab: SlabState
  slabNumber: number
  canRemove: boolean
  onChange: (updates: Partial<SlabState>) => void
  onRemove: () => void
  kpiLibrary: KPIEntry[]
}

/** Predefined list of tables users can filter on */
const AVAILABLE_TABLES = [
  { value: 'channel_master', label: 'Channel Master' },
  { value: 'agent_master', label: 'Agent Master' },
  { value: 'policy_master', label: 'Policy Master' },
  { value: 'product_master', label: 'Product Master' },
  { value: 'branch_master', label: 'Branch Master' },
  { value: 'designation_master', label: 'Designation Master' },
  { value: 'sales_activity', label: 'Sales Activity' },
  { value: 'commission_master', label: 'Commission Master' },
]

/** Lookup map for O(1) table label resolution */
const AVAILABLE_TABLES_MAP = new Map(AVAILABLE_TABLES.map((t) => [t.value, t.label]))

/** Placeholder value used by Radix Select when no table is selected */
const TABLE_SELECT_NONE = '__table_none__'

/** Inner component that owns the table schema fetch for the active slab */
function TableFilterTab({
  slab,
  onChange,
}: {
  slab: SlabState
  onChange: (updates: Partial<SlabState>) => void
}) {
  const { fields, loading, error } = useTableSchema(slab.selectedFilterTable)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // When fields load (or table changes) and the existing query has no rules, seed it
  useEffect(() => {
    if (!slab.selectedFilterTable || fields.length === 0) return
    const q = slab.tableFilterQuery
    if (!q || q.children.length === 0) {
      onChangeRef.current({ tableFilterQuery: createEmptyGroup(fields) })
    }
  }, [fields, slab.selectedFilterTable, slab.tableFilterQuery])

  const handleTableChange = (tableName: string) => {
    if (tableName === TABLE_SELECT_NONE) return
    onChange({
      selectedFilterTable: tableName,
      tableFilterQuery: createEmptyGroup([]),
    })
  }

  return (
    <div className="space-y-4">
      {/* Table selector */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-neutral-600">
          Select Table
        </label>
        <Select value={slab.selectedFilterTable || TABLE_SELECT_NONE} onValueChange={handleTableChange}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Choose a table to filter on…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TABLE_SELECT_NONE} disabled>
              — Choose a table —
            </SelectItem>
            {AVAILABLE_TABLES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                <span className="flex items-center gap-2">
                  <FiDatabase className="h-3.5 w-3.5 text-neutral-400" />
                  {t.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-1 text-[11px] text-neutral-400">
          Pick a database table to dynamically load its columns as filter fields.
        </p>
      </div>

      {/* Schema loading / error states */}
      {slab.selectedFilterTable && loading && (
        <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs text-neutral-500">
          <svg className="h-4 w-4 animate-spin text-teal-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Loading schema for <strong>{slab.selectedFilterTable}</strong>…
        </div>
      )}

      {slab.selectedFilterTable && !loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          <p className="font-semibold">Failed to load schema</p>
          <p className="mt-0.5">{error}</p>
        </div>
      )}

      {slab.selectedFilterTable && !loading && !error && fields.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          No columns returned for <strong>{slab.selectedFilterTable}</strong>. The table may not
          exist or the API returned an empty schema.
        </div>
      )}

      {/* Query builder — shown when fields are available */}
      {fields.length > 0 && (
        <QueryBuilder
          fields={fields}
          value={slab.tableFilterQuery ?? createEmptyGroup(fields)}
          onChange={(next) => onChange({ tableFilterQuery: next })}
          title={`Filter on ${AVAILABLE_TABLES_MAP.get(slab.selectedFilterTable) ?? slab.selectedFilterTable}`}
          description="Build row-level filter conditions using table columns. Conditions are combined with AND/OR logic."
        />
      )}

      {/* Empty state — no table selected yet */}
      {!slab.selectedFilterTable && (
        <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-center">
          <FiDatabase className="mx-auto mb-2 h-5 w-5 text-neutral-400" />
          <p className="text-xs text-neutral-500">
            Select a table above to load its columns and start building filter conditions.
          </p>
        </div>
      )}
    </div>
  )
}

const SlabSection = ({ slab, slabNumber, canRemove, onChange, onRemove, kpiLibrary }: SlabSectionProps) => {
  const expressionRef = useRef<HTMLTextAreaElement>(null)
  const [kpiSearch, setKpiSearch] = useState('')

  useEffect(() => {
    let next = slab.kpiCriteriaQueries
    let changed = false
    for (const sel of slab.selectedKPIs) {
      if (next[sel.kpiId]) continue
      const kpi = kpiLibrary.find((k) => k.id === sel.kpiId)
      if (!kpi) continue
      changed = true
      next = {
        ...next,
        [sel.kpiId]: createEmptyGroup(buildFieldsFromKpi(kpi)),
      }
    }
    if (changed) onChange({ kpiCriteriaQueries: next })
  }, [slab.selectedKPIs, slab.kpiCriteriaQueries, kpiLibrary, onChange])

  const filteredLibrary = useMemo(
    () =>
      kpiLibrary.filter(
        (k) =>
          !kpiSearch ||
          k.name.toLowerCase().includes(kpiSearch.toLowerCase()) ||
          k.description.toLowerCase().includes(kpiSearch.toLowerCase()),
      ),
    [kpiSearch, kpiLibrary],
  )

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

  const isKPISelected = (id: string) => slab.selectedKPIs.some((s) => s.kpiId === id)

  const toggleKPI = (id: string) => {
    if (slab.selectedKPIs.some((s) => s.kpiId === id)) {
      const { [id]: _removed, ...restQueries } = slab.kpiCriteriaQueries
      onChange({
        selectedKPIs: slab.selectedKPIs.filter((s) => s.kpiId !== id),
        kpiCriteriaQueries: restQueries,
      })
      return
    }

    const kpi = kpiLibrary.find((k) => k.id === id)
    const fields = kpi ? buildFieldsFromKpi(kpi) : []
    onChange({
      selectedKPIs: [...slab.selectedKPIs, { kpiId: id, weight: 1 }],
      kpiCriteriaQueries: {
        ...slab.kpiCriteriaQueries,
        [id]: createEmptyGroup(fields),
      },
    })
  }

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
        {/* ── KPI Library — pick KPIs for this slab ── */}
        <Card className="rounded-lg border border-neutral-200">
          <CardHeader className="px-4 pb-2 pt-4">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">KPI Library</CardTitle>
              <div className="w-56">
                <Input
                  label=""
                  variant="outlined"
                  placeholder="Search KPI..."
                  value={kpiSearch}
                  onChange={(e) => setKpiSearch(e.target.value)}
                />
              </div>
            </div>
            <p className="mt-0.5 text-xs text-neutral-500">
              Select KPIs for this slab. These KPIs become available in expressions.
            </p>
          </CardHeader>
          <CardContent className="px-4 pb-4">Filter Criteria

            {kpiLibrary.length === 0 ? (
              <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-center">
                <FiInfo className="mx-auto mb-2 h-5 w-5 text-neutral-400" />
                <p className="text-xs text-neutral-500">
                  No KPIs loaded yet. Save the program first (so we have a programId), then the KPI list will load here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="max-h-56 overflow-auto rounded-md border border-neutral-200">
                  {filteredLibrary.length === 0 ? (
                    <div className="p-3 text-xs text-neutral-500">No KPIs match your search.</div>
                  ) : (
                    filteredLibrary.map((kpi) => (
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
                    ))
                  )}
                </div>

                <p className="text-xs text-neutral-400">
                  Selected: <span className="font-medium text-neutral-600">{slab.selectedKPIs.length}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── 1. Program Details — moved to top of page ── */}
        {/* <Card className="rounded-lg border border-neutral-200">
          <CardHeader className="px-4 pb-2 pt-4">
            <CardTitle className="text-base">Program Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            <div>
              <Label className="text-xs font-semibold text-neutral-600">Program Name *</Label>
              <Input
                label=""
                variant="outlined"
                className="mt-1"
                placeholder="e.g., Q1 2025 Sales Excellence Program"
                value={slab.programName}
                onChange={(e) => onChange({ programName: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-neutral-600">Description</Label>
              <textarea
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                rows={3}
                placeholder="Describe the objectives and scope of this incentive program…"
                value={slab.programDescription}
                onChange={(e) => onChange({ programDescription: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-neutral-600">Start Date *</Label>
                <Input
                  label=""
                  variant="outlined"
                  type="date"
                  className="mt-1"
                  value={slab.startDate}
                  onChange={(e) => onChange({ startDate: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-neutral-600">End Date *</Label>
                <Input
                  label=""
                  variant="outlined"
                  type="date"
                  className="mt-1"
                  value={slab.endDate}
                  onChange={(e) => onChange({ endDate: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* ── 3. Filter Criteria — tabbed: Selected KPI | Selection Expression ── */}
        <Card className="rounded-lg border border-neutral-200">
          <CardHeader className="px-4 pb-2 pt-4">
            <CardTitle className="text-base">Filter Criteria</CardTitle>
            <p className="mt-0.5 text-xs text-neutral-500">
              Define which sales personnel qualify for this slab. Use the{' '}
              <strong>Selected KPI</strong> tab to configure KPI weights, or switch to{' '}
              <strong>Selection Expression</strong> for advanced SQL-based filtering.
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
                <TabsTrigger value="table-filter" className="gap-1.5">
                  <FiDatabase className="h-3.5 w-3.5" />
                  Table Filter
                </TabsTrigger>
              </TabsList>

              {/* Tab: Selected KPI */}
              <TabsContent value="selected-kpi">
                {slab.selectedKPIs.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-center">
                    <FiInfo className="mx-auto mb-2 h-5 w-5 text-neutral-400" />
                    <p className="text-xs text-neutral-400">
                      No KPIs selected yet. Choose from the library above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {slab.selectedKPIs.map((sel, idx) => {
                      const kpi = kpiLibrary.find((k) => k.id === sel.kpiId)
                      if (!kpi) return null
                      const fields = buildFieldsFromKpi(kpi)
                      const query = slab.kpiCriteriaQueries[sel.kpiId] ?? createEmptyGroup(fields)
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
                              fields={fields}
                              value={query}
                              onChange={(next) =>
                                onChange({
                                  kpiCriteriaQueries: { ...slab.kpiCriteriaQueries, [sel.kpiId]: next },
                                })
                              }
                              title="KPI filter (optional)"
                              description="This filter applies only to this KPI when it is selected."
                              className="mt-2"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Tab: Selection Expression */}
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
                  description="Build eligibility criteria with AND/OR and nested groups. This generates an SQL WHERE fragment."
                />
              </TabsContent>

              {/* Tab: Table Filter */}
              <TabsContent value="table-filter">
                <TableFilterTab slab={slab} onChange={onChange} />
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
                  Select KPIs above to make variables available here.
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
  selectedFilterTable: '',
  tableFilterQuery: createEmptyGroup([]),
})


// ─── Shared KPI Library (loaded from API) ────────────────────────────────────

const KPI_LIBRARY_PLACEHOLDER: KPIEntry[] = []

export default function IncentiveProgramConfig() {
  const navigate = useNavigate()
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
  const [isSavingFilters, setIsSavingFilters] = useState(false)
  const [cappingAmount, setCappingAmount] = useState<string>('')
  const [executionFrequency, setExecutionFrequency] = useState<string>('MONTHLY')
  const [selectionExpression, setSelectionExpression] = useState<string>('')

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
  const [agentFilter, setAgentFilter] = useState<AgentFilterState>({
    channels: [],
    subChannels: [],
    branches: [],
    designations: [],
  })

  // ─── API state ───────────────────────────────────────────────────────────────
  const [kpiLibrary, setKpiLibrary] = useState<KPIEntry[]>(KPI_LIBRARY_PLACEHOLDER)
  const [kpiLibraryLoading, setKpiLibraryLoading] = useState(false)
  const [kpisListOptions, setKpisListOptions] = useState<Array<{ kpiId: number; kpiName: string }>>([])
  const [kpisListLoading, setKpisListLoading] = useState(false)
  const [selectedKpiIds, setSelectedKpiIds] = useState<number[]>([])
  const [pastPrograms, setPastPrograms] = useState<IIncentiveProgram[]>([])
  const [apiDesignations, setApiDesignations] = useState<Record<string, string[]>>({})
  const [designationsLoading, setDesignationsLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [selectedWeightages, setSelectedWeightages] = useState<string[]>([])
  const [pastCycleProgram, setPastCycleProgram] = useState<string>('')

  const [pastProgramOptions, setPastProgramOptions] = useState<CascadeOption[]>(
    [],
  )
  const [selectedPastProgramId, setSelectedPastProgramId] = useState('')
  const [pastQualifications, setPastQualifications] = useState<
    PastQualificationRow[]
  >([])
  const [pastQualificationsLoading, setPastQualificationsLoading] =
    useState(false)


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

  // Fetch KPI library for this program (Selected KPI tab)
  useEffect(() => {
    let cancelled = false

    const normalizeKpiLibrary = (payload: any): KPIEntry[] => {
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
        .map((item: any): KPIEntry | null => {
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
        .filter(Boolean) as KPIEntry[]
    }

    const fetchLibrary = async () => {
      if (!programId) {
        setKpiLibrary([])
        return
      }

      try {
        setKpiLibraryLoading(true)
        const res = await incentiveService.getSelectedProgramKpis(programId)
        if (cancelled) return
        setKpiLibrary(normalizeKpiLibrary(res))
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

  // Fetch channels from cascade API on mount (no payload)
  useEffect(() => {
    let cancelled = false
    setChannelsLoading(true)
      ;(async () => {
        try {
          const res = await incentiveService.getFiltersCascade({})
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

  // Load programs list for Past Qualified Cycles dropdown
  useEffect(() => {
    let cancelled = false
      ;(async () => {
        try {
          const res: any = await incentiveService.getPrograms({
            pageNumber: 1,
            pageSize: 200,
          })

          if (cancelled) return

          const body = res?.responseBody ?? res
          const list =
            body?.items ??
            body?.programs ??
            body?.programList ??
            body?.programsList ??
            (Array.isArray(body) ? body : [])

          const rows = Array.isArray(list) ? list : extractFirstObjectArray(res)

          const opts = mapCascadeOptions(rows, ['programId', 'id'], [
            'programName',
            'name',
            'title',
            'label',
          ])
          setPastProgramOptions(opts)
        } catch (err) {
          if (!cancelled) setPastProgramOptions([])
        }
      })()
    return () => {
      cancelled = true
    }
  }, [])

  // Load past qualifications when a program is selected
  useEffect(() => {
    let cancelled = false
    const idNum = selectedPastProgramId ? Number(selectedPastProgramId) : NaN
    if (!Number.isFinite(idNum) || idNum <= 0) {
      setPastQualifications([])
      setPastQualificationsLoading(false)
      return
    }

    setPastQualificationsLoading(true)
      ;(async () => {
        try {
          const res: any = await incentiveService.getPastQualifications(idNum)
          const body = res?.responseBody ?? res

          // Try common keys first, then fall back to first object-array found
          const rows =
            body?.qualifications ??
            body?.pastQualifications ??
            body?.items ??
            (Array.isArray(body) ? body : null) ??
            extractFirstObjectArray(body)

          const normalized = (Array.isArray(rows) ? rows : []).map((r) =>
            r && typeof r === 'object' ? r : { value: r },
          ) as PastQualificationRow[]

          if (!cancelled) setPastQualifications(normalized)
        } catch (err) {
          if (!cancelled) setPastQualifications([])
        } finally {
          if (!cancelled) setPastQualificationsLoading(false)
        }
      })()

    return () => {
      cancelled = true
    }
  }, [selectedPastProgramId])

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
          const res = await incentiveService.getFiltersCascade({
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
          const res = await incentiveService.getFiltersCascade({
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
          const res = await incentiveService.getFiltersCascade({
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

    const effectiveFrom = toIso(startDate)
    const effectiveTo = toIso(endDate)

    if (!effectiveFrom) {
      showToast(NOTIFICATION_CONSTANTS.ERROR, 'Start Date is required')
      return
    }
    if (!effectiveTo) {
      showToast(NOTIFICATION_CONSTANTS.ERROR, 'End Date is required')
      return
    }

    const cappingAmountNum = parseFloat(cappingAmount) || 0

    setIsSaving(true)
    try {
      const res = await incentiveService.upsertProgram({
        programName: name,
        description: description.trim(),
        effectiveFrom,
        effectiveTo,
        executionFrequency: cronValue,
        selectionExpression: '',
        cappingAmount: cappingAmountNum,
        kpiIds: selectedKpiIds,
      })

      const programmeID = res?.responseBody?.incentiveProgram?.programId
      setProgrammeId(programmeID)

      const id = extractProgramId(res)
      if (id) setProgramId(id)
      if (id) {
        showToast(NOTIFICATION_CONSTANTS.SUCCESS, 'Program saved successfully')
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

  // Derive past cycles list from loaded programs
  const pastCycles: PastCycle[] = useMemo(
    () =>
      pastPrograms
        .filter((p) => p.status?.toLowerCase() === 'completed' || new Date(p.endDate) < new Date())
        .map((p) => ({
          date: p.endDate,
          name: p.name,
          executionDate: p.createdAt ?? p.endDate,
        })),
    [pastPrograms],
  )

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
      // Reload programs list
      incentiveService.getPrograms({ pageNumber: 1, pageSize: 100 })
        .then((result) => setPastPrograms(result?.items ?? []))
        .catch(() => { })
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
                  Configure the name, description, and duration for the active
                  incentive program.
                </p>
              </div>
              <MdOutlineInfo className="mt-1 h-4 w-4 text-neutral-400" />
            </CardHeader>

            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Input
                    label="Program Name *"
                    value={programName}
                    onChange={(e) => setProgramName(e.target.value)}
                    placeholder="e.g., Q1 2025 Sales Excellence Program"
                    variant="standardone"
                  />
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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <DatePicker
                    label="Start Date *"
                    value={startDate}
                    onChange={setStartDate}
                    placeholder="dd-mm-yyyy"
                  />
                  <DatePicker
                    label="End Date *"
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

              
                 
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      Choose The KPI's
                    </label>
                    <MultiSelectInline
                      options={kpisListOptions}
                      placeholder="Search KPIs..."
                      onChange={(ids) => {
                        setSelectedKpiIds(ids) // 👉 [1,4,2,5]
                      }}
                    />
                  </div>

               
              </div>
              <div className="mt-10">
                <div className="">
                  <CardTitle className="text-lg mb-2 font-semibold">
                    Execution Frequency
                  </CardTitle>
                  <p className="my-2  text-xs text-neutral-500">
                    Configure when this incentive program should run.
                  </p>
                </div>

                <CardContent className="px-0 pb-4">
                  <IncentiveConfig
                    commissionConfigId={0}
                    initialData={null}
                    isEditMode={false}
                    onCronChange={(cron) => {
                      setCronValue(cron)
                      console.log("Cron from child:", cron)
                    }}
                    onSaveSuccess={() => {
                      console.log("Schedule saved successfully")
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
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-md border border-neutral-200">
            {/* minmax(0,1fr) lets the weightage panel shrink so it cannot overlap the header */}
            <div className="grid grid-cols-1 border-neutral-200 md:grid-cols-[minmax(12rem,20rem)_minmax(0,1fr)] md:divide-x">
              <CardHeader className="min-w-0 border-b border-neutral-200 px-4 py-3 md:border-b-0">
                <CardTitle className="text-base font-semibold">
                  Weightage
                </CardTitle>
                <p className="mt-1 text-xs text-neutral-500">
                  Select the applicable weightage options for this incentive
                  program.
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
                  programId={programmeId ?? 0} // ✅ IMPORTANT
                  onSuccess={(users) => {
                    console.log("Saved users:", users)
                  }}
                />
              </CardContent>
            </div>
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
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-base font-semibold">
                Past Qualified Cycles
              </CardTitle>
              <p className="mt-1 text-xs text-neutral-500">
                Reference a list of previously qualified incentive program
                cycles.
              </p>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:items-end">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                      Select Program
                    </label>
                    <Select
                      value={selectedPastProgramId || CASCADE_NONE}
                      onValueChange={(v) =>
                        setSelectedPastProgramId(v === CASCADE_NONE ? '' : v)
                      }
                    >
                      <SelectTrigger className="input-text !h-10 w-full rounded-sm border border-gray-400 bg-white px-3 py-2 text-sm">
                        <SelectValue
                          placeholder={
                            pastProgramOptions.length
                              ? 'Select a past cycle program'
                              : 'No programs found'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={CASCADE_NONE}>
                          Select a program
                        </SelectItem>
                        {pastProgramOptions.map((o) => (
                          <SelectItem key={o.id} value={String(o.id)}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-xs text-neutral-500">
                    {selectedPastProgramId
                      ? `Showing qualifications for programId: ${selectedPastProgramId}`
                      : 'Pick a program to view past qualifications.'}
                  </div>
                </div>

                <DataTable
                  columns={(() => {
                    const first = pastQualifications[0] as any
                    const keys =
                      first && typeof first === 'object'
                        ? Object.keys(first).slice(0, 8)
                        : []
                    if (!keys.length) {
                      return [
                        {
                          header: 'Result',
                          accessor: (row: any) => JSON.stringify(row),
                        },
                      ]
                    }
                    return keys.map((k) => ({
                      header: k,
                      accessor: (row: any) => {
                        const v = row?.[k]
                        if (v == null) return '—'
                        if (typeof v === 'object') return JSON.stringify(v)
                        return String(v)
                      },
                    }))
                  })()}
                  data={pastQualifications as any[]}
                  loading={pastQualificationsLoading}
                  noDataMessage={
                    selectedPastProgramId
                      ? 'No qualifications found for this program.'
                      : 'Select a program to load qualifications.'
                  }
                />
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
                      <button
                        key={slab.id}
                        type="button"
                        onClick={() => setActiveSlabId(slab.id)}
                        className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm transition border-l-2 ${isActive
                          ? 'border-l-teal-500 bg-teal-50 font-semibold text-teal-700 shadow-sm'
                          : 'border-l-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
                          }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${isActive ? 'text-teal-600' : 'text-neutral-500'}`}>
                            Slab {index + 1}
                          </p>
                          <p className={`truncate text-sm ${hasName ? 'text-neutral-800' : 'text-neutral-400 italic'}`}>
                            {hasName ? slab.programName : 'Untitled'}
                          </p>
                        </div>
                        {isActive && <FiChevronRight className="h-3.5 w-3.5 shrink-0 text-teal-500" />}
                      </button>
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
              onClick={() => navigate({ to: '/search/incentive' as any })}
            >
              Back to Incentive
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

