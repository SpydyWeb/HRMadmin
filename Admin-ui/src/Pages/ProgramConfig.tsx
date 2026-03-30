import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import Button from '@/components/ui/button'
import { useMasterData } from '@/hooks/useMasterData'
import { MASTER_DATA_KEYS } from '@/utils/constant'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Slab {
  id: number
  name: string
  minValue: number
  maxValue: number
  incentivePercent: number
  incentiveType: 'Percentage' | 'Flat'
  isActive: boolean
}

interface MultiSelectOption {
  label: string
  value: string
}

// ─── Mock Past Qualified Cycles ───────────────────────────────────────────────

const MOCK_CYCLES = [
  { date: 'Jan 2025 – Mar 2025', name: 'Q1 FY2025 Incentive Program' },
  { date: 'Oct 2024 – Dec 2024', name: 'Q4 FY2024 Incentive Program' },
  { date: 'Jul 2024 – Sep 2024', name: 'Q3 FY2024 Incentive Program' },
  { date: 'Apr 2024 – Jun 2024', name: 'Q2 FY2024 Incentive Program' },
  { date: 'Jan 2024 – Mar 2024', name: 'Q1 FY2024 Incentive Program' },
]

// ─── Initial Slabs ────────────────────────────────────────────────────────────

const INITIAL_SLABS: Slab[] = [
  { id: 1, name: 'Slab 1', minValue: 0, maxValue: 100, incentivePercent: 5, incentiveType: 'Percentage', isActive: true },
  { id: 2, name: 'Slab 2', minValue: 101, maxValue: 500, incentivePercent: 10, incentiveType: 'Percentage', isActive: true },
  { id: 3, name: 'Slab 3', minValue: 501, maxValue: 9999, incentivePercent: 15, incentiveType: 'Percentage', isActive: true },
]

// ─── MultiSelect Component ────────────────────────────────────────────────────

interface MultiSelectProps {
  label: string
  options: MultiSelectOption[]
  selected: string[]
  onChange: (values: string[]) => void
  disabled?: boolean
}

const MultiSelect = ({ label, options, selected, onChange, disabled = false }: MultiSelectProps) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    )
  }

  const triggerLabel =
    selected.length === 0
      ? `Select ${label}`
      : selected.length === 1
        ? options.find((o) => o.value === selected[0])?.label ?? `1 selected`
        : `${selected.length} selected`

  return (
    <div className="flex flex-col gap-1" ref={ref}>
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          className={`w-full flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-left shadow-sm transition-colors
            ${disabled ? 'cursor-not-allowed opacity-50 bg-gray-50' : 'hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'}`}
        >
          <span className={selected.length === 0 ? 'text-gray-400' : 'text-gray-800'}>{triggerLabel}</span>
          <svg
            className={`h-4 w-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
            {options.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-400 text-center">No options available</div>
            ) : (
              <ul className="max-h-56 overflow-y-auto py-1">
                {options.map((opt) => (
                  <li
                    key={opt.value}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggle(opt.value)}
                  >
                    <Checkbox
                      checked={selected.includes(opt.value)}
                      onCheckedChange={() => toggle(opt.value)}
                      id={`ms-${label}-${opt.value}`}
                    />
                    <span className="text-sm text-gray-700 select-none">{opt.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const ProgramConfig = () => {
  const { getOptions, isLoading } = useMasterData([
    MASTER_DATA_KEYS.CHANNEL,
    MASTER_DATA_KEYS.SUB_CHANNELS,
    MASTER_DATA_KEYS.Office_Location,
    MASTER_DATA_KEYS.DESIGNATION,
  ])

  // Agent Filter State
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [selectedSubChannels, setSelectedSubChannels] = useState<string[]>([])
  const [selectedBranches, setSelectedBranches] = useState<string[]>([])
  const [selectedDesignations, setSelectedDesignations] = useState<string[]>([])

  // Slab State
  const [slabs, setSlabs] = useState<Slab[]>(INITIAL_SLABS)
  const [selectedSlabIndex, setSelectedSlabIndex] = useState<number>(0)
  const [nextSlabId, setNextSlabId] = useState<number>(4)

  const channelOptions = getOptions(MASTER_DATA_KEYS.CHANNEL)
  const subChannelOptions = getOptions(MASTER_DATA_KEYS.SUB_CHANNELS)
  const branchOptions = getOptions(MASTER_DATA_KEYS.Office_Location)
  const designationOptions = getOptions(MASTER_DATA_KEYS.DESIGNATION)

  const selectedSlab = slabs[selectedSlabIndex] ?? null

  // ── Slab Handlers ──

  const addSlab = () => {
    const newSlab: Slab = {
      id: nextSlabId,
      name: `Slab ${nextSlabId}`,
      minValue: 0,
      maxValue: 0,
      incentivePercent: 0,
      incentiveType: 'Percentage',
      isActive: true,
    }
    const updated = [...slabs, newSlab]
    setSlabs(updated)
    setSelectedSlabIndex(updated.length - 1)
    setNextSlabId((n) => n + 1)
  }

  const updateSlab = (field: keyof Slab, value: string | number | boolean) => {
    setSlabs((prev) =>
      prev.map((s, idx) => (idx === selectedSlabIndex ? { ...s, [field]: value } : s))
    )
  }

  const deleteSlab = (index: number) => {
    const updated = slabs.filter((_, i) => i !== index)
    setSlabs(updated)
    setSelectedSlabIndex(Math.min(selectedSlabIndex, updated.length - 1))
  }

  const handleChannelChange = (values: string[]) => {
    setSelectedChannels(values)
    setSelectedSubChannels([])
    setSelectedBranches([])
    setSelectedDesignations([])
  }

  const handleSubChannelChange = (values: string[]) => {
    setSelectedSubChannels(values)
    setSelectedBranches([])
    setSelectedDesignations([])
  }

  const handleBranchChange = (values: string[]) => {
    setSelectedBranches(values)
    setSelectedDesignations([])
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Program Configuration</h1>
          <p className="text-sm text-gray-500 mt-1">Configure incentive program slabs and agent filters</p>
        </div>
        <Button variant="default" size="sm">
          Save Configuration
        </Button>
      </div>

      {/* ── Section 1: Agent Filter ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Agent Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              Loading filter options...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MultiSelect
                label="Channel"
                options={channelOptions}
                selected={selectedChannels}
                onChange={handleChannelChange}
              />
              <MultiSelect
                label="Sub Channel"
                options={subChannelOptions}
                selected={selectedSubChannels}
                onChange={handleSubChannelChange}
                disabled={selectedChannels.length === 0}
              />
              <MultiSelect
                label="Branches"
                options={branchOptions}
                selected={selectedBranches}
                onChange={handleBranchChange}
                disabled={selectedSubChannels.length === 0}
              />
              <MultiSelect
                label="Designations"
                options={designationOptions}
                selected={selectedDesignations}
                onChange={setSelectedDesignations}
                disabled={selectedBranches.length === 0}
              />
            </div>
          )}

          {/* Active filter chips */}
          {(selectedChannels.length > 0 || selectedSubChannels.length > 0 || selectedBranches.length > 0 || selectedDesignations.length > 0) && (
            <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-gray-100">
              {[
                { label: 'Channel', values: selectedChannels, opts: channelOptions },
                { label: 'Sub Channel', values: selectedSubChannels, opts: subChannelOptions },
                { label: 'Branch', values: selectedBranches, opts: branchOptions },
                { label: 'Designation', values: selectedDesignations, opts: designationOptions },
              ].flatMap(({ label, values, opts }) =>
                values.map((v) => {
                  const display = opts.find((o) => o.value === v)?.label ?? v
                  return (
                    <span key={`${label}-${v}`} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      {label}: {display}
                    </span>
                  )
                })
              )}
              <button
                className="text-xs text-gray-400 hover:text-red-500 underline ml-1"
                onClick={() => {
                  setSelectedChannels([])
                  setSelectedSubChannels([])
                  setSelectedBranches([])
                  setSelectedDesignations([])
                }}
              >
                Clear all
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Section 2: Past Qualified Cycles ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Past Qualified Cycles
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-600 w-1/3">Incentive Program Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Incentive Program Name</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_CYCLES.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-10 text-center text-gray-400">
                      <svg className="mx-auto h-10 w-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      No past qualified cycles found
                    </td>
                  </tr>
                ) : (
                  MOCK_CYCLES.map((cycle, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-700 font-medium">{cycle.date}</td>
                      <td className="px-4 py-3 text-gray-600">{cycle.name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 3: Slab Configuration ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Slab Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex gap-0 rounded-lg border border-gray-200 overflow-hidden min-h-[360px]">
            {/* Left Panel – Slab List */}
            <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
                <span className="text-sm font-semibold text-gray-700">Slabs</span>
                <button
                  onClick={addSlab}
                  className="flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Slab
                </button>
              </div>

              <ul className="flex-1 overflow-y-auto py-2">
                {slabs.length === 0 && (
                  <li className="px-4 py-6 text-center text-sm text-gray-400">No slabs defined</li>
                )}
                {slabs.map((slab, idx) => (
                  <li
                    key={slab.id}
                    onClick={() => setSelectedSlabIndex(idx)}
                    className={`group flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors
                      ${idx === selectedSlabIndex
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${slab.isActive ? 'bg-green-400' : 'bg-gray-400'} ${idx === selectedSlabIndex ? 'bg-green-300' : ''}`} />
                      <span className="text-sm font-medium">{slab.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs ${idx === selectedSlabIndex ? 'text-blue-200' : 'text-gray-400'}`}>
                        {slab.incentivePercent}{slab.incentiveType === 'Percentage' ? '%' : '₹'}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteSlab(idx) }}
                        className={`ml-1 rounded p-0.5 transition-colors opacity-0 group-hover:opacity-100
                          ${idx === selectedSlabIndex ? 'hover:bg-blue-500 text-blue-100' : 'hover:bg-red-100 text-red-400'}`}
                        title="Delete slab"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Panel – Slab Form */}
            <div className="flex-1 bg-white flex flex-col">
              {selectedSlab === null ? (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                    <p className="text-sm">Select or add a slab to configure</p>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-semibold text-gray-800">{selectedSlab.name} — Details</h3>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
                      ${selectedSlab.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${selectedSlab.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {selectedSlab.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Slab Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Slab Name</label>
                      <input
                        type="text"
                        value={selectedSlab.name}
                        onChange={(e) => updateSlab('name', e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter slab name"
                      />
                    </div>

                    {/* Min Value */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Min Value</label>
                      <input
                        type="number"
                        value={selectedSlab.minValue}
                        onChange={(e) => updateSlab('minValue', Number(e.target.value))}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min={0}
                      />
                    </div>

                    {/* Max Value */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Max Value</label>
                      <input
                        type="number"
                        value={selectedSlab.maxValue}
                        onChange={(e) => updateSlab('maxValue', Number(e.target.value))}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min={0}
                      />
                    </div>

                    {/* Incentive % */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Incentive {selectedSlab.incentiveType === 'Percentage' ? '%' : 'Amount (₹)'}
                      </label>
                      <input
                        type="number"
                        value={selectedSlab.incentivePercent}
                        onChange={(e) => updateSlab('incentivePercent', Number(e.target.value))}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min={0}
                        step={0.01}
                      />
                    </div>

                    {/* Incentive Type */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Incentive Type</label>
                      <select
                        value={selectedSlab.incentiveType}
                        onChange={(e) => updateSlab('incentiveType', e.target.value as 'Percentage' | 'Flat')}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        <option value="Percentage">Percentage</option>
                        <option value="Flat">Flat</option>
                      </select>
                    </div>

                    {/* Is Active */}
                    <div className="sm:col-span-2 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Active Status</p>
                        <p className="text-xs text-gray-500 mt-0.5">Toggle to enable or disable this slab</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateSlab('isActive', !selectedSlab.isActive)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                          ${selectedSlab.isActive ? 'bg-blue-600' : 'bg-gray-300'}`}
                        role="switch"
                        aria-checked={selectedSlab.isActive}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                            ${selectedSlab.isActive ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSlabs(INITIAL_SLABS)}
                    >
                      Reset
                    </Button>
                    <Button variant="default" size="sm">
                      Save Slab
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProgramConfig
