import { useEffect, useMemo, useState } from 'react'
import { MdOutlineInfo } from 'react-icons/md'
import { FiFilter } from 'react-icons/fi'
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
import { NOTIFICATION_CONSTANTS } from '@/utils/constant'

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

export default function IncentiveProgramConfig() {
  const navigate = useNavigate()

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
  const [designationsLoading, setDesignationsLoading] = useState(false)

  const anyChannelSelected = useMemo(
    () => Object.values(channels).some(Boolean),
    [channels],
  )

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

    ;(async () => {
      setWeightagesLoading(true)
      try {
        const res = await incentiveService.getWeightages()
        const options = normalizeWeightages(res)

        if (cancelled) return

        if (!options.length) {
          // Fallback to existing static labels if API returns unexpected shape
          const fallback: WeightageOption[] = [
            { key: 'A', id: null, label: 'Weightage A' },
            { key: 'B', id: null, label: 'Weightage B' },
            { key: 'C', id: null, label: 'Weightage C' },
          ]
          setWeightageOptions(fallback)
          setWeightage((prev) => {
            const next = { ...prev }
            fallback.forEach((o) => {
              if (next[o.key] === undefined) next[o.key] = false
            })
            return next
          })
          return
        }

        setWeightageOptions(options)
        setWeightage((prev) => {
          const next: Record<string, boolean> = { ...prev }
          options.forEach((o) => {
            if (next[o.key] === undefined) next[o.key] = false
          })
          // Remove keys that no longer exist in options
          Object.keys(next).forEach((k) => {
            if (!options.some((o) => o.key === k)) delete next[k]
          })
          return next
        })
      } catch (err: any) {
        if (cancelled) return
        // Keep UI usable even if API fails
        const fallback: WeightageOption[] = [
          { key: 'A', id: null, label: 'Weightage A' },
          { key: 'B', id: null, label: 'Weightage B' },
          { key: 'C', id: null, label: 'Weightage C' },
        ]
        setWeightageOptions(fallback)
        setWeightage((prev) => ({ A: prev.A ?? false, B: prev.B ?? false, C: prev.C ?? false }))
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.errorMessage ||
          err?.message ||
          'Failed to load weightages'
        showToast(NOTIFICATION_CONSTANTS.ERROR, message)
      } finally {
        if (!cancelled) setWeightagesLoading(false)
      }
    })()

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
    ;(async () => {
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
    ;(async () => {
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
    ;(async () => {
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
              <div className="flex flex-wrap gap-8">
                {weightagesLoading && !weightageOptions.length ? (
                  <p className="text-sm text-neutral-500">Loading weightages…</p>
                ) : (
                  weightageOptions.map((w) => (
                    <label
                      key={w.key}
                      className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700"
                    >
                      <Checkbox
                        checked={Boolean(weightage[w.key])}
                        onCheckedChange={(checked) =>
                          setWeightage((prev) => ({
                            ...prev,
                            [w.key]: Boolean(checked),
                          }))
                        }
                      />
                      {w.label}
                    </label>
                  ))
                )}
              </div>
              <div className="mt-4 flex items-center justify-end">
                <Button
                  variant="blue"
                  onClick={handleSaveWeightages}
                  isLoading={isSavingWeightages}
                  disabled={isSavingWeightages}
                  loadingText="Saving..."
                >
                  Save Weightage
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

