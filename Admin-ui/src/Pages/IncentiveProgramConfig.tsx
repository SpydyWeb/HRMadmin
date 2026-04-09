import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { MdOutlineInfo } from 'react-icons/md'
import { FiChevronRight, FiCode, FiFilter, FiInfo, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi'
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
import { Badge } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SelectionExpressionBuilder from '@/components/SelectionExpressionBuilder'
import { IncentiveConfig } from '@/components/incentives/IncentiveConfig'
import { AddUserDialog, AddUserInline } from '@/components/incentives/AddUserDialog'

type WeightageOption = { key: string; id: number | null; label: string }

type ChannelKey = 'Bancassurance' | 'Agency' | 'Direct' | 'Broker'

/**
 * Static UI labels; `cascadeChannelId` is sent as `channelId` to filters/cascade.
 * Ids match API `cascadingFilters.channels` (e.g. Agency=1, Bancassurance=2, Broker=5).
 */



const CHANNELS: Array<{
  key: ChannelKey
  label: string
  cascadeChannelId: number
}> = [
    { key: 'Bancassurance', label: 'Bancassurance', cascadeChannelId: 2 },
    { key: 'Agency', label: 'Agency', cascadeChannelId: 1 },
    { key: 'Direct', label: 'Direct', cascadeChannelId: 3 },
    { key: 'Broker', label: 'Broker', cascadeChannelId: 5 },
  ]

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
  selectionExpression: string
  incentiveExpression: string
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

const SlabSection = ({ slab, slabNumber, canRemove, onChange, onRemove, kpiLibrary }: SlabSectionProps) => {
  const expressionRef = useRef<HTMLTextAreaElement>(null)
  const [kpiSearch, setKpiSearch] = useState('')

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
    onChange({
      selectedKPIs: slab.selectedKPIs.some((s) => s.kpiId === id)
        ? slab.selectedKPIs.filter((s) => s.kpiId !== id)
        : [...slab.selectedKPIs, { kpiId: id, weight: 1 }],
    })
  }

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
                        </div>
                      )
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Tab: Selection Expression */}
              <TabsContent value="expression">
                <SelectionExpressionBuilder
                  expression={slab.selectionExpression}
                  onChange={(expr) => onChange({ selectionExpression: expr })}
                  availableFields={kpiFields}
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
  selectionExpression: '',
  incentiveExpression: '',
})


// ─── Shared KPI Library (loaded from API) ────────────────────────────────────

const KPI_LIBRARY_PLACEHOLDER: KPIEntry[] = []

export default function IncentiveProgramConfig() {
  const navigate = useNavigate()
  // const [programId, setProgramId] = useState<number | null>(null)
  const [open, setOpen] = useState(true)
  const [programName, setProgramName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [programId, setProgramId] = useState<number | null>(null)
  const [isSavingWeightages, setIsSavingWeightages] = useState(false)

  const [weightageOptions, setWeightageOptions] = useState<WeightageOption[]>(
    [],
  )
  const [weightage, setWeightage] = useState<Record<string, boolean>>({})
  const [weightagesLoading, setWeightagesLoading] = useState(true)

  const [channels, setChannels] = useState<Record<ChannelKey, boolean>>({
    Bancassurance: false,
    Agency: false,
    Direct: false,
    Broker: false,
  })

  const [subChannelOptions, setSubChannelOptions] = useState<CascadeOption[]>([])
  const [branchOptions, setBranchOptions] = useState<CascadeOption[]>([])
  const [designationOptions, setDesignationOptions] = useState<CascadeOption[]>(
    [],
  )
  const [selectedSubChannelId, setSelectedSubChannelId] = useState('')
  const [selectedBranchId, setSelectedBranchId] = useState('')
  const [selectedDesignationId, setSelectedDesignationId] = useState('')
  const [subChannelsLoading, setSubChannelsLoading] = useState(false)
  const [branchesLoading, setBranchesLoading] = useState(false)

  const anyChannelSelected = useMemo(
    () => Object.values(channels).some(Boolean),
    [channels],
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
  const [pastPrograms, setPastPrograms] = useState<IIncentiveProgram[]>([])
  const [apiDesignations, setApiDesignations] = useState<Record<string, string[]>>({})
  const [designationsLoading, setDesignationsLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [selectedWeightages, setSelectedWeightages] = useState<string[]>([])
  const [pastCycleProgram, setPastCycleProgram] = useState<string>('')


  /** First checked channel in fixed order — used for cascade API `channelId`. */
  const primaryCascadeChannelId = useMemo(() => {
    for (const c of CHANNELS) {
      if (channels[c.key]) return c.cascadeChannelId
    }
    return null
  }, [channels])

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

  useEffect(() => {
    setSelectedSubChannelId('')
    setSelectedBranchId('')
    setSelectedDesignationId('')
  }, [primaryCascadeChannelId])

  useEffect(() => {
    setSelectedBranchId('')
    setSelectedDesignationId('')
  }, [selectedSubChannelId])

  useEffect(() => {
    setSelectedDesignationId('')
  }, [selectedBranchId])

  useEffect(() => {
    let cancelled = false
    if (primaryCascadeChannelId == null) {
      setSubChannelOptions([])
      setSubChannelsLoading(false)
      return
    }
    setSubChannelsLoading(true)
      ; (async () => {
        try {
          const res = await incentiveService.postFilterCascade({
            channelId: primaryCascadeChannelId,
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
  }, [primaryCascadeChannelId])

  const subChannelIdNum = selectedSubChannelId
    ? Number(selectedSubChannelId)
    : NaN

  useEffect(() => {
    let cancelled = false
    if (
      primaryCascadeChannelId == null ||
      !Number.isFinite(subChannelIdNum) ||
      subChannelIdNum <= 0
    ) {
      setBranchOptions([])
      setBranchesLoading(false)
      return
    }
    setBranchesLoading(true)
      ; (async () => {
        try {
          const res = await incentiveService.postFilterCascade({
            channelId: primaryCascadeChannelId,
            subChannelId: subChannelIdNum,
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
  }, [primaryCascadeChannelId, selectedSubChannelId])

  const branchIdNum = selectedBranchId ? Number(selectedBranchId) : NaN

  useEffect(() => {
    let cancelled = false
    if (
      primaryCascadeChannelId == null ||
      !Number.isFinite(subChannelIdNum) ||
      subChannelIdNum <= 0 ||
      !Number.isFinite(branchIdNum) ||
      branchIdNum <= 0
    ) {
      setDesignationOptions([])
      setDesignationsLoading(false)
      return
    }
    setDesignationsLoading(true)
      ; (async () => {
        try {
          const res = await incentiveService.postFilterCascade({
            channelId: primaryCascadeChannelId,
            subChannelId: subChannelIdNum,
            branchId: branchIdNum,
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
  }, [primaryCascadeChannelId, selectedSubChannelId, selectedBranchId])

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

    setIsSaving(true)
    try {
      const res = await incentiveService.upsertProgram({
        programName: name,
        description: description.trim(),
        effectiveFrom,
        effectiveTo,
      })
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
          <div className="shrink-0">
            <Button variant="blue" disabled className="min-w-[140px]">
              Save All Slabs
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="rounded-md border border-neutral-200">
            <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 py-3">
              <div>
                <CardTitle className="text-base font-semibold">
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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                </div>

                <div className="mt-4">
                  <Input
                    label="Select KPIs for Calculation"
                    value={programName}
                    description="Choose pre-defined KPIs to use in the incentive calculation formula."
                    onChange={(e) => setProgramName(e.target.value)}
                    placeholder="Search KPIs..."
                    variant="standardone"
                  />
                </div>
              </div>

              <Card className="rounded-md border border-neutral-200 mt-10">
                <CardHeader className="px-4">
                  <CardTitle className="text-base font-semibold">
                    Execution Frequency
                  </CardTitle>
                  <p className="mt-1 text-xs text-neutral-500">
                    Configure when this incentive program should run.
                  </p>
                </CardHeader>

                <CardContent className="px-4 pb-4">
                  <IncentiveConfig
                    commissionConfigId={0}   // 👈 reuse same prop
                    initialData={null}                    // or API data if edit mode
                    isEditMode={false}
                    onSaveSuccess={() => {
                      console.log('Schedule saved successfully')
                    }}
                  />
                </CardContent>
              </Card>

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
            <CardHeader className="px-4 py-3">
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
            <CardContent className="px-4 pb-4">
              <AddUserInline
                onSuccess={(users) => console.log(users)}
              />
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
                    <div className="space-y-2">
                      {CHANNELS.map((c) => (
                        <label
                          key={c.key}
                          className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700"
                        >
                          <Checkbox
                            checked={channels[c.key]}
                            onCheckedChange={(checked) =>
                              setChannels((prev) => ({
                                ...prev,
                                [c.key]: Boolean(checked),
                              }))
                            }
                          />
                          {c.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Sub Channel <span className="text-red-600">*</span>
                  </label>
                  <Select
                    value={selectedSubChannelId || CASCADE_NONE}
                    onValueChange={(v) =>
                      setSelectedSubChannelId(v === CASCADE_NONE ? '' : v)
                    }
                    disabled={!anyChannelSelected || subChannelsLoading}
                  >
                    <SelectTrigger className="input-text !h-10 w-full rounded-sm border border-gray-400 bg-white px-3 py-2 text-sm">
                      <SelectValue
                        placeholder={
                          subChannelsLoading
                            ? 'Loading…'
                            : !anyChannelSelected
                              ? 'Select Channel first'
                              : subChannelOptions.length === 0
                                ? 'No sub-channels'
                                : 'Select Sub Channel'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CASCADE_NONE}>
                        {subChannelsLoading
                          ? 'Loading…'
                          : !anyChannelSelected
                            ? 'Select Channel first'
                            : subChannelOptions.length === 0
                              ? 'No sub-channels'
                              : 'Select Sub Channel'}
                      </SelectItem>
                      {subChannelOptions.map((o) => (
                        <SelectItem key={o.id} value={String(o.id)}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-1">
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Branches
                  </label>
                  <Select
                    value={selectedBranchId || CASCADE_NONE}
                    onValueChange={(v) =>
                      setSelectedBranchId(v === CASCADE_NONE ? '' : v)
                    }
                    disabled={!selectedSubChannelId || branchesLoading}
                  >
                    <SelectTrigger className="input-text !h-10 w-full rounded-sm border border-gray-400 bg-white px-3 py-2 text-sm">
                      <SelectValue
                        placeholder={
                          branchesLoading
                            ? 'Loading…'
                            : !selectedSubChannelId
                              ? 'Select Sub Channel first'
                              : branchOptions.length === 0
                                ? 'No branches'
                                : 'Select Branch'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CASCADE_NONE}>
                        {branchesLoading
                          ? 'Loading…'
                          : !selectedSubChannelId
                            ? 'Select Sub Channel first'
                            : branchOptions.length === 0
                              ? 'No branches'
                              : 'Select Branch'}
                      </SelectItem>
                      {branchOptions.map((o) => (
                        <SelectItem key={o.id} value={String(o.id)}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-1">
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Designations
                  </label>
                  <Select
                    value={selectedDesignationId || CASCADE_NONE}
                    onValueChange={(v) =>
                      setSelectedDesignationId(v === CASCADE_NONE ? '' : v)
                    }
                    disabled={!selectedBranchId || designationsLoading}
                  >
                    <SelectTrigger className="input-text !h-10 w-full rounded-sm border border-gray-400 bg-white px-3 py-2 text-sm">
                      <SelectValue
                        placeholder={
                          designationsLoading
                            ? 'Loading…'
                            : !selectedBranchId
                              ? 'Select Branch first'
                              : designationOptions.length === 0
                                ? 'No designations'
                                : 'Select Designation'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CASCADE_NONE}>
                        {designationsLoading
                          ? 'Loading…'
                          : !selectedBranchId
                            ? 'Select Branch first'
                            : designationOptions.length === 0
                              ? 'No designations'
                              : 'Select Designation'}
                      </SelectItem>
                      {designationOptions.map((o) => (
                        <SelectItem key={o.id} value={String(o.id)}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
              <div className="rounded-md border border-dashed border-neutral-300 bg-white p-4 text-sm text-neutral-500">
                No cycles selected yet.
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

